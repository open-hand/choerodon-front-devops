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
    jobName,
  } = props;
  // 是cd阶段的这些类型
  const isCd = ['cdHost', 'cdDeploy', 'cdExternalApproval', 'cdDeployment'].includes(type);
  // 是ci阶段的这些类型
  const isCi = ['build', 'sonar', 'custom', 'chart'].includes(type);

  const prefixCls = useMemo(() => 'c7n-pipelineManage-codeLog', []);
  const [interval, setInterTime] = useState(isCi ? 5000 : null);
  const [logData, setLogData] = useState();

  /**
   * 处理ci isCi 类型任务的logs
   * @param {*} ciLogsData
   * @return {*}
   */
  function handleCiLogs(ciLogsData) {
    const {
      logs,
      endFlag,
    } = ciLogsData || {};
    if (endFlag) setInterTime(null);
    if (logData) {
      const logDataArr = logData.split(/\n/); // 旧数据
      const newLogsArr = logs.split(/\n/); // 新数据
      let diffArr = [];
      // 找出旧数据和新数据不一样的地方，这里对比数组长度
      // 如果长度相等，相当于前后数据可能就只有最后一行发生了变化，对比最后一行数据长度
      if (logDataArr.length === newLogsArr.length) {
        diffArr = [newLogsArr[newLogsArr.length - 1]];
      } else {
        diffArr = newLogsArr.slice(logDataArr.length);
      }
      if (diffArr.length) {
        setLogData(logs);
        forEach(diffArr, (str) => term.writeln(str));
      }
      return;
    }
    const newRes = logs.split(/\n/);
    forEach(newRes, (item) => term.writeln(item));
    setLogData(logs);
  }

  async function loadData() {
    if (!isCd && !isCi) {
      return;
    }
    const getData = isCd
      ? pipeLineRecordsApi.getCdPipelineLogs(cdRecordId, stageRecordId, jobRecordId)
      : ciJobsApi.getCiPipelineLogs(gitlabProjectId, gitlabJobId, appServiceId);
    try {
      const res = await getData;
      if (!res?.failed) {
        if (isCi) {
          handleCiLogs(res);
          return;
        }
        const newRes = res.split(/\n/);
        forEach(newRes, (item) => term.writeln(item));
        setLogData(res);
      } else {
        term.writeln('暂无日志');
      }
      setInterTime(null);
    } catch (e) {
      Choerodon.handleResponseError(e);
      setInterTime(null);
    }
  }

  const handleDownload = useCallback(() => {
    const blob = new Blob([logData], { type: 'text/plain' });
    const filename = `${jobName}-日志.log`;
    saveAs(blob, filename);
  }, [logData]);

  const handleTimer = () => {
    if (!isNil(interval)) {
      setInterTime(null);
    } else {
      setInterTime(5000);
    }
  };

  const goTop = () => {
    term.scrollToTop();
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
    term.scrollToBottom();
  }, interval, { immediate: true });

  return (
    <>
      {isCi && (
        <div className={`${prefixCls}-btn`}>
          <Button
            icon="get_app-o"
            color="primary"
            onClick={handleDownload}
            className={`${prefixCls}-download`}
          >
            下载日志
          </Button>
        </div>
      )}
      <div className={`${prefixCls}-container`}>
        <div className={`${prefixCls} ${isCi ? `${prefixCls}-hasBtn` : ''}`} id="jobLog" />
        {isCi && (
          <div className={`${prefixCls}-btnGorups`}>
            <div
              onClick={handleTimer}
              role="none"
              className={`${prefixCls}-btnGorups-btn ${prefixCls}-btnGorups-btn-following`}
            >
              {isNil(interval) ? 'Start Following' : 'Stop Following'}
            </div>
            <div
              onClick={goTop}
              role="none"
              className={`${prefixCls}-btnGorups-btn ${prefixCls}-btnGorups-btn-top`}
            >
              Go Top
            </div>
          </div>
        )}
      </div>
    </>
  );
});
