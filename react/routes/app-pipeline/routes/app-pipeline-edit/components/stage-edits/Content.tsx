import React from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { Alert } from 'choerodon-ui';
import { useStageEditsStore } from './stores';
import Stage from './components/stage';
import StageAddBtn from './components/stage-btn';
import { STAGE_CD, STAGE_CI } from '../../stores/CONSTANTS';
import { STAGE_TYPES } from '../../interface';
import useStageEdit from './hooks/useStageEdit';

const StageEdits = () => {
  const {
    prefixCls,
  } = useStageEditsStore();

  const {
    getSourceData,
  } = useStageEdit();

  const renderStages = () => {
    const groups = map(getSourceData, (stage:any, index:number) => {
      const { type: currentStageType } = stage;
      let addStageType:STAGE_TYPES | '' = '';
      const nextStageType = getSourceData?.[index + 1]?.type;
      // 当前stageType为ci类型，则存在两种情况，一种是下一个是CI，那么新增就是CI，否则就是CD
      if (currentStageType === STAGE_CI) {
        if (!nextStageType) addStageType = '';
        if (nextStageType === STAGE_CI) {
          addStageType = STAGE_CI;
        }
      } else {
        addStageType = STAGE_CD;
      }
      return (
        <>
          <Stage key={stage?.id} {...stage} stageIndex={index} />
          <StageAddBtn
            addStageType={addStageType}
            showNextLine={index !== getSourceData.length - 1}
            stageIndex={index + 1}
          />
        </>
      );
    });

    /**
     * return ''表示增加哪个阶段都行
     * @return {*}
     */
    const nextStageType = () => {
      const firstType = getSourceData?.[0]?.type;
      if (!getSourceData.length || firstType === STAGE_CD) {
        return '';
      }
      return STAGE_CI;
    };

    return (
      <>
        {/* 第一个按钮 */}
        <StageAddBtn
          addStageType={nextStageType()}
          showPreLine={false}
          stageIndex={0}
        />
        {groups}
      </>
    );
  };

  return (
    <div className={prefixCls}>
      <Alert showIcon type="warning" message="此页面定义了CI阶段或其中的任务后，GitLab仓库中的.gitlab-ci.yml文件也会同步修改。" />
      <div className={`${prefixCls}-container`}>
        {renderStages()}
      </div>
    </div>
  );
};

export default observer(StageEdits);
