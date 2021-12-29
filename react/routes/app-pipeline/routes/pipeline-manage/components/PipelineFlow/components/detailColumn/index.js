/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

import React from 'react';
import { observer } from 'mobx-react-lite';
import './index.less';
import getDuration from '@/utils/getDuration';
import DetailItem from './detailItem';

export default observer((props) => {
  // 抛出piplineName
  const {
    piplineStageName,
    piplineStageStatus,
    jobRecordVOList,
    stageSeconds,
    stageType,
    parallel,
    triggerType = 'auto',
    handleRefresh,
    history,
    location,
    stageId,
    cdRecordId,
    viewId,
    gitlabPipelineId,
  } = props;

  const renderItem = () => {
    const hasJobs = jobRecordVOList && jobRecordVOList.length > 0;
    const lists = hasJobs
      && jobRecordVOList.map((item, i) => {
        // eslint-disable-next-line no-param-reassign
        item.display = 'none';
        return item;
      });
    return hasJobs
      ? lists.map((item) => {
        const {
          status,
          gitlabJobId,
          id: jobRecordId,
          durationSeconds,
          type,
          name,
          ...rest
        } = item;
        return (
          <DetailItem
            gitlabPipelineId={gitlabPipelineId}
            key={gitlabJobId}
            jobStatus={status}
            jobRecordId={jobRecordId}
            handleRefresh={handleRefresh}
            history={history}
            location={location}
            stageId={stageId}
            jobDurationSeconds={durationSeconds}
            itemType={type}
            jobName={name}
            gitlabJobId={gitlabJobId}
            cdRecordId={cdRecordId}
            viewId={viewId}
            {...rest}
          />
        );
      })
      : '无执行详情...';
  };

  const realType = stageType?.toUpperCase();

  return (
    <div
      className={`c7n-piplineManage-detail-column c7n-piplineManage-detail-column-${piplineStageStatus}`}
    >
      <div className="c7n-piplineManage-detail-column-header">
        {/* <StatusDot size={17} status={piplineStatus} /> */}
        <span>{piplineStageName}</span>
        <span
          className={`c7n-piplineManage-stage-type c7n-piplineManage-stage-type-${realType}`}
        >
          {realType}
        </span>
        {stageSeconds ? <span>{getDuration(stageSeconds)}</span> : null}
      </div>
      <div className="c7n-piplineManage-detail-column-lists">
        <h6>
          任务列表
          {/* Todo 加上串并行逻辑后优化判断 */}
          <span
            className={`c7n-piplineManage-stage-type-task c7n-piplineManage-stage-type-task-${
              parallel || realType === 'CI' ? 'parallel' : 'serial'
            }`}
          >
            { parallel || realType === 'CI' ? '任务并行' : '任务串行'}
          </span>
        </h6>
        {renderItem()}
      </div>
      <div className="c7n-piplineManage-detail-column-type">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="9" viewBox="0 0 28 9">
          <path fill="#6887E8" d="M511.5,131 L520.5,135.5 L511.5,140 L511.5,136 L493,136 L493,135 L511.5,135 L511.5,131 Z" transform="translate(-493 -131)" />
        </svg>
      </div>
    </div>
  );
});
