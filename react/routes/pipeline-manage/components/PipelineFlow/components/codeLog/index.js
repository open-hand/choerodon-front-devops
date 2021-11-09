import React, {
  useCallback, useMemo, useState,
} from 'react';
import forEach from 'lodash/forEach';
import { Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import { observer } from 'mobx-react-lite';
import { Choerodon } from '@choerodon/master';
import { Button } from 'choerodon-ui/pro';
import { saveAs } from 'file-saver';
import { useInterval, useMount, useUnmount } from 'ahooks';

import 'xterm/dist/xterm.css';
import './index.less';
import { isNil } from 'lodash';
import { ciJobsApi, pipeLineRecordsApi } from '@/api';

const term = new Terminal({
  fontSize: 13,
  fontWeight: 400,
  fontFamily: 'monospace',
  disableStdin: true,
});

export default observer((props) => {
  const {
    gitlabJobId,
    gitlabProjectId,
    type,
    cdRecordId,
    stageRecordId,
    jobRecordId,
    viewId,
    appServiceId,
  } = props;
  const isCd = ['cdHost', 'cdDeploy', 'cdExternalApproval', 'cdDeployment'].includes(type);

  const prefixCls = useMemo(() => 'c7n-pipelineManage-codeLog', []);
  const [interval, setInterTime] = useState(isCd ? null : 5000);
  const [logData, setLogData] = useState();

  async function loadData() {
    const getData = isCd
      ? pipeLineRecordsApi.getCdPipelineLogs(cdRecordId, stageRecordId, jobRecordId)
      : ciJobsApi.getCiPipelineLogs(gitlabProjectId, gitlabJobId, appServiceId);
    try {
      const res = await getData;
      if (!res?.failed) {
        const {
          logs,
          endFlag,
        } = res || {};
        if (endFlag) setInterTime(null);
        if (logData) {
          const tempStr = logs.slice(logData.length);
          if (tempStr.length) {
            setLogData(logs);
            term.write();
            forEach(tempStr.split(/\n/), (str) => term.write(str));
          }
          return;
        }
        const newRes = logs.split(/\n/);
        forEach(newRes, (item) => term.writeln(item));
        setLogData(logs);
      } else {
        term.writeln('暂无日志');
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
  }

  const handleDownload = useCallback(() => {
    const blob = new Blob([logData], { type: 'text/plain' });
    const filename = `#${viewId}-构建日志.log`;
    saveAs(blob, filename);
  }, [logData]);

  const handleTimer = () => {
    if (!isNil(interval)) {
      setInterTime(null);
    } else {
      setInterTime(5000);
    }
  };

  useMount(() => {
    term.open(document.getElementById('jobLog'));
    fit(term);
  });

  useUnmount(() => {
    term.clear();
  });

  useInterval(() => {
    loadData();
  }, interval, { immediate: true });

  return (
    <>
      {type === 'build' && (
        <div className={`${prefixCls}-btn`}>
          <Button
            icon={isNil(interval) ? 'play_arrow' : 'stop'}
            onClick={handleTimer}
          />
          <Button
            icon="get_app-o"
            color="primary"
            onClick={handleDownload}
            className={`${prefixCls}-download`}
          >
            下载构建日志
          </Button>
        </div>
      )}
      <div className={`${prefixCls} ${type === 'build' ? `${prefixCls}-hasBtn` : ''}`} id="jobLog" />
    </>
  );
});
