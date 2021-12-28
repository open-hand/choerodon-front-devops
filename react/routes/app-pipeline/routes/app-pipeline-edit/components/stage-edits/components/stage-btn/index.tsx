import React from 'react';
import './index.less';
import { Icon } from 'choerodon-ui/pro';
import useStageModal from '../../hooks/useStageModal';
import { STAGE_TYPES } from '../../../../interface';
import useStageEdit from '../../hooks/useStageEdit';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

const prefixCls = 'c7ncd-pipeline-edit-stagebtn';

interface StageBtnProps {
  showPreLine?:boolean
  showNextLine?:boolean
  stageIndex:number // 当前添加的阶段应当在整个流水线阶段数组中的index
  addStageType:STAGE_TYPES | ''
}

const StageAddBtn = (props:StageBtnProps) => {
  const {
    showPreLine,
    stageIndex,
    showNextLine,
    addStageType,
  } = props;

  const {
    level,
  } = usePipelineContext();

  const {
    addStage,
  } = useStageEdit();

  const handleOk = (stageData:any) => {
    addStage(stageIndex, stageData);
  };

  const openStageModal = useStageModal('create', {
    onOk: handleOk,
    initialValue: {
      type: level === 'create' ? addStageType : 'CI',
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
