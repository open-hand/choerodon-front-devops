import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { Alert } from 'choerodon-ui';
import { DragDropContext } from 'react-beautiful-dnd';
import { useBoolean } from 'ahooks';
import { throttle } from 'lodash';
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
    orderStage,
  } = useStageEdit();

  const [fromToId, setFromToId] = useState<string>('');
  const [isDragging, { setFalse, setTrue }] = useBoolean(false);

  const handleDragEnd = useCallback(
    (pos: { destination: any; source:any }) => {
      const { destination, source } = pos;
      if (!destination) {
        return;
      }
      orderStage(source?.index, destination?.index);
      setFromToId('');
      setFalse();
    },
    [],
  );

  const handleDragOver = throttle((pos: { destination: any; source:any }) => {
    const { destination, source } = pos;
    window.requestIdleCallback(() => {
      destination?.droppableId && setFromToId(`${source.index}-${destination?.index}`);
    });
  }, 100, { immediate: true });

  /** @type {*} 获取下一个stage应该添加的数据类型 */
  const getAddStageType = useCallback(
    (currentStageType:STAGE_TYPES, index:number) => {
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
      return addStageType;
    },
    [],
  );

  const renderStages = useCallback(
    () => {
      const fromTo = fromToId;
      const groups = map(getSourceData, (stage:any, index:number) => {
        const { type: currentStageType } = stage;
        const addStageType = getAddStageType(currentStageType, index);
        return (
          <>
            <Stage
              key={stage?.id}
              {...stage}
              stageIndex={index}
              fromToId={fromTo}
              isDragging={isDragging}
            />
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
    },
    [fromToId, getAddStageType, getSourceData, isDragging],
  );

  return (
    <div className={prefixCls}>
      <Alert showIcon type="warning" message="此页面定义了CI阶段或其中的任务后，GitLab仓库中的.gitlab-ci.yml文件也会同步修改。" />
      <div className={`${prefixCls}-container`}>
        <DragDropContext
          onDragStart={() => window.requestAnimationFrame(setTrue)}
          onDragEnd={handleDragEnd}
          onDragUpdate={handleDragOver}
        >
          {renderStages()}
        </DragDropContext>
      </div>
    </div>
  );
};

export default observer(StageEdits);
