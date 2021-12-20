import React from 'react';
import { Icon } from 'choerodon-ui/pro';
import './index.less';
import { Popover } from 'choerodon-ui';
import ParalleLines from '../paralle-lines';
import SerialLines from '../serial-lines';
import JobTypesPanel from './components/job-types-panel';

const prefixCls = 'c7ncd-pipeline-edit-jobbtn';

interface JobAddBtnProps {
  type:'circle' | 'normal'
  linesType: 'paralle' | 'serial'
  handleJobAddCallback: (jobData:any)=>void
}

const JobAddBtn = (props:JobAddBtnProps) => {
  const {
    type,
    linesType,
    handleJobAddCallback,
  } = props;

  const linesMap = {
    paralle: <ParalleLines />,
    serial: <SerialLines />,
  } as const;

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
      content={<JobTypesPanel handleJobAddCallback={handleJobAddCallback} />}
      placement={'bottom' as any}
      overlayClassName={`${prefixCls}-popover`}
    >
      {renderContent()}
    </Popover>
  );
};

export default JobAddBtn;
