import React, { useEffect } from 'react';
import { Icon } from 'choerodon-ui/pro';
import './index.less';
import ParalleLines from '../paralle-lines';
import SerialLines from '../serial-lines';

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

  useEffect(() => {

  }, []);

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

JobAddBtn.defaultProps = {
  type: 'circle',
  stageType: 'paralle',
};

export default JobAddBtn;
