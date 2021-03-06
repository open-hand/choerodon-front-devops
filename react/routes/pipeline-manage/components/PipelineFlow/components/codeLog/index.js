import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import forEach from 'lodash/forEach';
import { Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import { observer } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';
import { Button } from 'choerodon-ui/pro';
import { saveAs } from 'file-saver';

import 'xterm/dist/xterm.css';
import './index.less';

export default observer((props) => {
  const {
    gitlabJobId, projectId, gitlabProjectId, type, cdRecordId,
    stageRecordId, jobRecordId, viewId,
  } = props;

  const prefixCls = useMemo(() => 'c7n-pipelineManage-codeLog', []);
  const [logData, setLogData] = useState();

  const term = new Terminal({
    fontSize: 13,
    fontWeight: 400,
    fontFamily: 'monospace',
    disableStdin: true,
  });

  async function loadData() {
    try {
      if (['cdHost', 'cdDeploy', 'cdExternalApproval'].includes(type)) {
        const res = await axios.get(`/devops/v1/projects/${projectId}/pipeline_records/${cdRecordId}/stage_records/${stageRecordId}/job_records/log/${jobRecordId}`);
        if (res && !res.failed) {
          const newRes = res.split(/\n/);
          forEach(newRes, (item) => term.writeln(item));
          setLogData(res);
        } else {
          term.writeln('暂无日志');
        }
      } else {
        const res = await axios.get(`/devops/v1/projects/${projectId}/ci_jobs/gitlab_projects/${gitlabProjectId}/gitlab_jobs/${gitlabJobId}/trace`);
        if (res && !res.failed) {
          const newRes = res.split(/\n/);
          forEach(newRes, (item) => term.writeln(item));
          setLogData(res);
        } else {
          term.writeln('暂无日志');
        }
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
  }

  useEffect(() => {
    loadData();
    term.open(document.getElementById('jobLog'));
    fit(term);
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([logData], { type: 'text/plain' });
    const filename = `#${viewId}-构建日志.log`;
    saveAs(blob, filename);
  }, [logData]);

  return (
    <>
      {type === 'build' && (
        <div className={`${prefixCls}-btn`}>
          <Button
            icon="refresh"
            onClick={() => {
              const joblog = document.getElementById('jobLog');
              joblog.parentNode.removeChild(joblog);
              const parent = document.querySelector('.c7n-pro-modal-body');
              const child = document.createElement('div');
              child.setAttribute('id', 'jobLog');
              child.setAttribute('class', `${prefixCls} ${type === 'build' ? `${prefixCls}-hasBtn` : ''}`);
              parent.appendChild(child);
              term.clear();
              loadData();
              term.open(document.getElementById('jobLog'));
              fit(term);
              // term.open(document.getElementById('jobLog'));
              // term.writeln('空');
              // loadData();
            }}
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
