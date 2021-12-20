import React, { useEffect } from 'react';
import './index.less';
import { Icon } from 'choerodon-ui/pro';
import useStageModal from '../../hooks/useStageModal';
import { STAGE_TYPES } from '../../../../interface';
import { useStageEditsStore } from '../../stores';

const prefixCls = 'c7ncd-pipeline-edit-stagebtn';

interface StageBtnProps {
  showPreLine?:boolean
  showNextLine?:boolean
  stageIndex:number // 当前添加的阶段应当在整个流水线阶段数组中的index
  addStageType:STAGE_TYPES | ''
}

const StageAddBtn = (props:StageBtnProps) => {
  const {
    mainStore: {
      addStage,
    },
  } = useStageEditsStore();

  const {
    showPreLine,
    stageIndex,
    showNextLine,
    addStageType,
  } = props;

  const handleOk = (stageData:any) => {
    addStage(stageIndex, stageData);
  };

  const openStageModal = useStageModal('create', {
    onOk: handleOk,
    initialValue: {
      type: addStageType,
    },
  });

  return (
    <div className={prefixCls}>
      {showPreLine && <div className={`${prefixCls}-line`} />}
      <Icon type="add" onClick={openStageModal} />
      {showNextLine && <div className={`${prefixCls}-line`} />}
    </div>
  );
};

StageAddBtn.defaultProps = {
  showPreLine: true,
  showNextLine: true,
};

export default StageAddBtn;
