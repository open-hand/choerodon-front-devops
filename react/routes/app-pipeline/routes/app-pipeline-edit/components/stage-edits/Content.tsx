import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import { Alert, message } from 'choerodon-ui';
import { DragDropContext } from 'react-beautiful-dnd';
import { useBoolean } from 'ahooks';
import { throttle } from 'lodash';
import { useStageEditsStore } from './stores';
import Stage from './components/stage';
import StageAddBtn from './components/stage-btn';
import { STAGE_CD, STAGE_CI } from '../../stores/CONSTANTS';
import { STAGE_TYPES } from '../../interface';
import useStageEdit from './hooks/useStageEdit';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

const StageEdits = () => {
  const {
    prefixCls,
  } = useStageEditsStore();

  const {
    getSourceData,
    orderStage,
  } = useStageEdit();

  const {
    level,
  } = usePipelineContext();

  const [fromToId, setFromToId] = useState<string>('');
  const [isDragging, { setFalse, setTrue }] = useBoolean(false);

  const handleDragEnd = useCallback(
    (pos: { destination: any; source:any }) => {
      const { destination, source } = pos;
      if (!destination) {
        setFromToId('');
        setFalse();
        return;
      }
      const sourceType = getSourceData[source.index]?.type;
      const destType = getSourceData[destination.index]?.type;
      if (sourceType !== destType) {
        message.info('阶段顺序必须满足CI阶段在CD阶段之前！');
        setFromToId('');
        setFalse();
        return;
      }
      window.requestAnimationFrame(() => {
        orderStage(source?.index, destination?.index);
        setFromToId('');
        setFalse();
      });
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
        addStageType = !nextStageType ? '' : STAGE_CI;
      } else {
        addStageType = STAGE_CD;
      }
      return addStageType;
    },
    [getSourceData?.length],
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

  const renderDragContainer = useCallback(() => (
    <DragDropContext
      onDragStart={() => {
        window.requestIdleCallback(setTrue);
      }}
      onDragEnd={handleDragEnd}
      onDragUpdate={handleDragOver}
      style={{ overflow: 'auto' }}
    >
      {renderStages()}
    </DragDropContext>
  ), [handleDragEnd, handleDragOver, renderStages, setTrue]);

  return (
    <div className={prefixCls}>
      {
        level === 'project' ? <Alert closable showIcon type="warning" message="此页面定义了CI阶段或其中的任务后，GitLab仓库中的.gitlab-ci.yml文件也会同步修改。" /> : ''
      }
      <div className={`${prefixCls}-container`}>
        {renderDragContainer()}
      </div>
    </div>
  );
};

export default observer(StageEdits);
