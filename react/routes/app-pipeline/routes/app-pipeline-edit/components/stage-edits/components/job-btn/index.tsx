/* eslint-disable max-len */
import React from 'react';
import { Icon } from 'choerodon-ui/pro';
import './index.less';
import { Popover } from 'choerodon-ui';
import ParalleLines from '../paralle-lines';
import SerialLines from '../serial-lines';
import JobTypesPanel from './components/job-types-panel';
import JobCdPanel from './components/job-CD-panel';

const prefixCls = 'c7ncd-pipeline-edit-jobbtn';

interface JobAddBtnProps {
  type:'circle' | 'normal'
  linesType: 'paralle' | 'serial'
  handleJobAddCallback: (jobData:any)=>void
  stageIndex:number
  jobIndex:number
}

const JobAddBtn = (props:JobAddBtnProps) => {
  const {
    type,
    linesType,
    handleJobAddCallback,
    stageIndex,
    jobIndex,
  } = props;

  const linesMap = {
    paralle: <ParalleLines />,
    serial: <SerialLines />,
  } as const;

  const jobTypePanelMap = {
    paralle: <JobTypesPanel handleJobAddCallback={handleJobAddCallback} />,
    serial: <JobCdPanel jobIndex={jobIndex} stageIndex={stageIndex} handleJobAddCallback={handleJobAddCallback} />,
  };

  const renderContent = () => {
    if (type === 'circle') {
      return <Icon type="add" className={`${prefixCls}`} />;
    }
    return (
      <div className={`${prefixCls}-normal`}>
        {linesMap[linesType]}
        <div className={`${prefixCls}-normal-content`}>
          <Icon type="add" />
          <span>添加任务</span>
        </div>
      </div>
    );
  };

  return (
    <Popover
      trigger={['click'] as any}
      content={jobTypePanelMap[linesType]}
      placement={'bottom' as any}
      overlayClassName={`${prefixCls}-popover`}
    >
      {renderContent()}
    </Popover>
  );
};

export default JobAddBtn;
