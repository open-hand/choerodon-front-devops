import React, { useEffect } from 'react';
import { Icon } from 'choerodon-ui/pro';
import './index.less';
import { Popover } from 'choerodon-ui';
import ParalleLines from '../paralle-lines';
import SerialLines from '../serial-lines';
import JobTypesPanel from './components/job-types-panel';
import { Placements } from '@/interface';

const prefixCls = 'c7ncd-pipeline-edit-jobbtn';

interface JobAddBtnProps {
  type?:'circle' | 'normal'
  stageType?: 'paralle' | 'serial'
}

const JobAddBtn = (props:JobAddBtnProps) => {
  const {
    type,
    stageType,
  } = props;

  const renderContent = () => {
    if (type === 'circle') {
      return <Icon type="add" className={`${prefixCls}`} />;
    }
    return (
      <div className={`${prefixCls}-normal`}>
        <SerialLines />
        {/* <ParalleLines /> */}
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
      content={<JobTypesPanel />}
      placement={'bottom' as any}
    >
      {renderContent()}
    </Popover>
  );
};

JobAddBtn.defaultProps = {
  type: 'circle',
  stageType: 'paralle',
};

export default JobAddBtn;
