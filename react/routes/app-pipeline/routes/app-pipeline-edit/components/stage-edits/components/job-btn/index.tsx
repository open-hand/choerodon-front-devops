/* eslint-disable max-len */
import React, { useState } from 'react';
import { Icon } from 'choerodon-ui/pro';
import './index.less';
import { Popover } from 'choerodon-ui';
import { useBoolean } from 'ahooks';
import ParalleLines from '../paralle-lines';
import SerialLines from '../serial-lines';
import JobTypesPanel from './components/job-types-panel';
import JobCdPanel from './components/job-CD-panel';

const prefixCls = 'c7ncd-pipeline-edit-jobbtn';

interface JobAddBtnProps {
  type:'circle' | 'normal'
  linesType: 'paralle' | 'serial'
  handleJobAddCallback:(addonData: any)=>(editData:any)=>void
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

  const [popoverVisible, { setFalse, toggle }] = useBoolean(false);

  const linesMap = {
    paralle: <ParalleLines />,
    serial: <SerialLines />,
  } as const;

  const handlePanelClickCallback = () => {
    setFalse();
  };

  const jobTypePanelMap = {
    paralle: <JobTypesPanel handleJobAddCallback={handleJobAddCallback} handlePanelClickCallback={handlePanelClickCallback} />,
    serial: <JobCdPanel jobIndex={jobIndex} stageIndex={stageIndex} handleJobAddCallback={handleJobAddCallback} handlePanelClickCallback={handlePanelClickCallback} />,
  };

  const renderContent = () => {
    if (type === 'circle') {
      return <Icon type="add" onClick={() => toggle()} className={`${prefixCls}`} />;
    }
    return (
      <div className={`${prefixCls}-normal`} onClick={() => { toggle(); }} role="none">
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
      visible={popoverVisible}
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
