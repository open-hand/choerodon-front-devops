import React, { useEffect } from 'react';
import './index.less';
import { Icon } from 'choerodon-ui/pro';

const prefixCls = 'c7ncd-pipeline-edit-stagebtn';

interface StageBtnProps {
  showPreLine?:boolean
  showNextLine?:boolean
}

const StageAddBtn = (props:StageBtnProps) => {
  const {
    showPreLine,
    showNextLine,
  } = props;
  useEffect(() => {

  }, []);

  return (
    <div className={prefixCls}>
      {showPreLine && <div className={`${prefixCls}-line`} />}
      <Icon type="add" />
      {showNextLine && <div className={`${prefixCls}-line`} />}
    </div>
  );
};

StageAddBtn.defaultProps = {
  showPreLine: true,
  showNextLine: true,
};

export default StageAddBtn;
