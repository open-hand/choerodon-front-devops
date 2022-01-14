/* eslint-disable consistent-return */
/* eslint-disable max-len */
import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import get from 'lodash/get';
import forEach from 'lodash/forEach';
import { Tooltip, Icon } from 'choerodon-ui/pro';
import { Loading } from '@choerodon/components';
import jobTypesMappings from '../../../../stores/jobsTypeMappings';
import { usePipelineManageStore } from '../../../../stores';
import { JOB_GROUP_TYPES } from '@/routes/app-pipeline/stores/CONSTANTS';
import StageType from '../stage-type';

import './index.less';

export default observer((props) => {
  const {
    mainStore: { getSelectedMenu },
    projectId,
    editBlockStore,
  } = usePipelineManageStore();

  const { id, name, appServiceName } = getSelectedMenu;

  const [leftLineDom, setLeftLineDom] = useState([]);
  const [rightLineDom, setRightLineDom] = useState([]);

  const {
    loadData,
    getLoading,
    getViewData,
  } = editBlockStore || {};

  useEffect(() => {
    id && loadData(projectId, id);
  }, [id, projectId]);

  useEffect(() => {
    const leftList = [];
    const rightList = [];
    forEach(getViewData, ({ jobList }, stageIndex) => {
      forEach(jobList, (data, index) => {
        const leftItem = (
          <div
            className="c7ncd-pipeline-detail-job-rect-left"
            style={getJobRectStyle(stageIndex, index)}
          />
        );
        const rightItem = (
          <div
            className="c7ncd-pipeline-detail-job-rect-right"
            style={getJobRectStyle(stageIndex, index)}
          />
        );
        if (leftList[stageIndex]) {
          leftList[stageIndex].push(leftItem);
          rightList[stageIndex].push(rightItem);
        } else {
          leftList[stageIndex] = [leftItem];
          rightList[stageIndex] = [rightItem];
        }
      });
    });
    setLeftLineDom(leftList);
    setRightLineDom(rightList);
  }, [getLoading, getViewData]);

  const getTriggerBranch = useCallback(({ triggerType, triggerValue }) => (
    <span>
      触发分支：
      {triggerType === 'exact_exclude' ? '精确排除 ' : ''}
      {triggerValue || '所有分支或tag'}
    </span>
  ), []);

  function getJobTask({
    jobType: type, metadata, iamUserDTOS, jobTriggerValue, triggerValue, envName, countersigned,
  }) {
    const branchContent = getTriggerBranch({ triggerType: jobTriggerValue, triggerValue });
    if (type === 'cdAudit') {
      return (
        <div className="c7ncd-pipeline-detail-job-task">
          <div className="c7ncd-pipeline-detail-job-task-deploy">
            <span className="c7ncd-pipeline-detail-job-task-deploy-item">
              审核人员：
              {map(iamUserDTOS || [], ({ loginName, realName, id: userId }, index) => (
                <span key={userId}>
                  {realName}
                  {index !== iamUserDTOS.length - 1 && ','}
                </span>
              ))}
            </span>
            <span className="c7ncd-pipeline-detail-job-task-deploy-item">
              审核模式：
              {countersigned === 0 ? '或签' : '会签'}
            </span>
            {branchContent}
          </div>
        </div>
      );
    }
    if (type === 'chart') {
      return (
        <div className="c7ncd-pipeline-detail-job-task c7ncd-pipeline-detail-job-task-branch">
          {branchContent}
        </div>
      );
    }
    if (!['normal', 'custom'].includes(type) && typeof metadata === 'string') {
      let newData = {};
      try {
        newData = JSON.parse(metadata.replace(/'/g, '"'));
      } catch (error) {
        throw new Error(error);
      }
      const {
        sonarUrl, config, scannerType, blockAfterJob,
      } = newData;
      let content;
      let showBranchContent;
      switch (type) {
        case 'sonar':
          content = (
            <div className="c7ncd-pipeline-detail-job-task-sonar">
              {branchContent}
              {sonarUrl ? (
                <>
                  <br />
                  <span>{sonarUrl}</span>
                  <span className="c7ncd-pipeline-detail-job-task-sonar-type">
                    检查类型:
                    <br />
                    {scannerType}
                  </span>
                </>
              ) : null}
            </div>
          );
          break;
        case 'cdDeploy':
        case 'cdHost':
          content = (
            <div className="c7ncd-pipeline-detail-job-task-deploy">
              {envName ? (
                <span className="c7ncd-pipeline-detail-job-task-deploy-item">
                  部署环境：
                  {envName}
                </span>
              ) : null}
              {branchContent}
            </div>
          );
          break;
        case 'build':
          showBranchContent = true;
          content = config ? (
            map(config, ({ name: taskName, sequence }) => (
              <div className="c7ncd-pipeline-detail-job-task-item" key={sequence}>
                {taskName}
              </div>
            ))
          ) : null;
          break;
        case 'cdApiTest':
          content = (
            <div className="c7ncd-pipeline-detail-job-task-deploy">
              <span className="c7ncd-pipeline-detail-job-task-deploy-item">
                是否阻塞：
                {blockAfterJob ? '是' : '否'}
              </span>
              {branchContent}
            </div>
          );
        default:
      }
      return (
        <>
          {showBranchContent && (
            <div className="c7ncd-pipeline-detail-job-task c7ncd-pipeline-detail-job-task-branch">
              {branchContent}
            </div>
          )}
          {content && (
            <div className="c7ncd-pipeline-detail-job-task">{content}</div>
          )}
        </>
      );
    }
  }

  function getJobRectStyle(stageIndex, index) {
    let sum = 0;
    for (let i = 0; i < index; i += 1) {
      sum += document.getElementById(`${id}-${stageIndex}-job-${i}`) ? document.getElementById(`${id}-${stageIndex}-job-${i}`).offsetHeight + 32 : 0;
    }
    return { height: sum };
  }

  const renderJobPrefix = (jobType, groupType) => {
    if (jobType?.indexOf('cd') !== -1) {
      return `【${jobTypesMappings[jobType]}】`;
    }
    const currentJobGroupType = JOB_GROUP_TYPES?.[groupType];
    return (
      <Tooltip title={get(currentJobGroupType, 'name')}>
        <Icon className="c7ncd-pipeline-detail-job-icon" type={get(currentJobGroupType, 'icon')} />
      </Tooltip>
    );
  };

  return (
    !getLoading ? (
      <div className="c7ncd-pipeline-detail">
        <div className="c7ncd-pipeline-detail-title">
          <span>{name}</span>
          <span className="c7ncd-pipeline-detail-title-appService">{appServiceName ? ` (${appServiceName}) ` : ''}</span>
        </div>
        <div className="c7ncd-pipeline-detail-content">
          {map(getViewData, ({
            id: stageId, name: stageName, jobList, type: stageType = 'CI', parallel, triggerType = 'auto',
          }, stageIndex) => (
            <div className="c7ncd-pipeline-detail-stage" key={`${stageId}-${stageIndex}`}>
              <div className="c7ncd-pipeline-detail-stage-title">
                <Tooltip title={stageName} placement="top">
                  <span className="c7ncd-pipeline-detail-stage-title-text">{stageName}</span>
                </Tooltip>
                <div className="c7ncd-pipeline-detail-stage-title-type">
                  <StageType type={stageType} parallel={parallel} />
                </div>
              </div>
              <div className="c7ncd-pipeline-detail-stage-line" />
              {stageIndex !== 0 ? (
                <div className="c7ncd-pipeline-detail-stage-arrow">
                  {triggerType === 'auto' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="9" viewBox="0 0 28 9">
                      <path fill="#6887E8" d="M511.5,131 L520.5,135.5 L511.5,140 L511.5,136 L493,136 L493,135 L511.5,135 L511.5,131 Z" transform="translate(-493 -131)" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="9" viewBox="0 0 26 9">
                      <path fill="#F1B42D" d="M917.5,130 L926.5,134.5 L917.5,139 L917.5,135 L913.5,135 L913.5,134 L917.5,134 L917.5,130 Z M905.5,134 L905.5,135 L901.5,135 L901.5,134 L905.5,134 Z M911.5,134 L911.5,135 L907.5,135 L907.5,134 L911.5,134 Z" transform="translate(-901 -130)" />
                    </svg>
                  )}
                </div>
              ) : null}
              {map(jobList, ({
                id: jobId, name: jobName, type: jobType, groupType, metadata, iamUserDTOS, triggerType: jobTriggerValue, triggerValue, envName, countersigned,
              }, index) => (
                <div key={`${stageId}-${jobId}`}>
                  {index && leftLineDom[stageIndex] ? leftLineDom[stageIndex][index] : null}
                  <div className={`c7ncd-pipeline-detail-job c7ncd-pipeline-detail-job-${stageType}`} id={`${id}-${stageIndex}-job-${index}`}>
                    <div className="c7ncd-pipeline-detail-job-title">
                      {renderJobPrefix(jobType, groupType)}
                      {jobName}
                    </div>
                    {jobType !== 'custom' && getJobTask({
                      jobType, metadata, iamUserDTOS, jobTriggerValue, triggerValue, envName, countersigned,
                    })}
                  </div>
                  {index && stageIndex !== getViewData.length - 1 && rightLineDom[stageIndex] ? rightLineDom[stageIndex][index] : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ) : <Loading display type="c7n" />
  );
});
