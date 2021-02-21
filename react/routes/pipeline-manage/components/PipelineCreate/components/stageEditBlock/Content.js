/* eslint-disable max-len */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { message } from 'choerodon-ui';
import {
  Droppable, Draggable, DragDropContext,
} from 'react-beautiful-dnd';
import EditColumn from './components/eidtColumn';
import { usePipelineStageEditStore } from './stores';

const defaultData = [
  {
    name: '构建',
    sequence: 1,
    jobList: [],
    type: 'CI',
    parallel: 1,
    triggerType: '',
  }, {
    name: '部署',
    sequence: 2,
    jobList: [],
    type: 'CD',
    parallel: 0,
    triggerType: 'auto',
  },
];

export default observer(() => {
  const {
    pipelineId,
    editBlockStore,
    appServiceId,
    appServiceName,
    appServiceCode,
    appServiceType,
    image,
    isEdit,
  } = usePipelineStageEditStore();

  const {
    setStepData,
    getStepData,
    editStepLists,
    getViewData,
  } = editBlockStore;

  useEffect(() => {
    let stageList = [];
    if (isEdit) {
      stageList = [...getViewData];
    } else if (appServiceId && appServiceType === 'test') {
      stageList = [...defaultData.slice(0, 1)];
    } else {
      stageList = [...defaultData];
    }
    setStepData(stageList);
  }, [appServiceId, appServiceType, getViewData, isEdit]);

  function renderColumn() {
    const dataSource = getStepData;
    if (dataSource && dataSource.length > 0) {
      return dataSource.map((item, index) => {
        const nextStageType = dataSource[index + 1]?.type && dataSource[index + 1]?.type.toUpperCase();
        return (
          <Draggable key={`dropStages-${item.sequence}`} draggableId={`dropStages-${item.sequence}`} index={index}>
            {
              (dragProvided, snapshotinner) => (
                <EditColumn
                  {...item}
                  snapshotinner={snapshotinner}
                  innerRef={dragProvided.innerRef}
                  dragProvided={dragProvided}
                  stagesSource={dataSource}
                  columnIndex={index}
                  key={item.id}
                  isLast={String(index) === String(dataSource.length - 1)}
                  isFirst={index === 0}
                  nextStageType={nextStageType}
                  pipelineId={pipelineId}
                  appServiceId={appServiceId}
                  appServiceName={appServiceName}
                  appServiceCode={appServiceCode}
                  appServiceType={appServiceType}
                  image={image}
                />
              )
            }
          </Draggable>
        );
      });
    }
    return [];
  }

  function swap(arr, from, to) {
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    return arr;
  }

  function onColomnDragEnd(data) {
    const { source, destination } = data;
    if (!destination) {
      return;
    }
    const sourceType = getStepData[source.index]?.type;
    const destType = getStepData[destination.index]?.type;
    if (sourceType !== destType) {
      message.error('CI阶段必须置于CD阶段之前');
      return;
    }
    const arr = [...swap(getStepData, source.index, destination.index)];
    arr.map((item, index) => {
      // eslint-disable-next-line no-param-reassign
      item.sequence = index;
      return item;
    });
    editStepLists(arr);
  }

  const getListStyle = (isDraggingOver) => ({
    border: isDraggingOver ? '2px dotted #5266d4' : 'none',
    borderRadius: isDraggingOver ? '3px' : '0',
    padding: '2px',
    background: isDraggingOver ? 'rgba(82, 102, 212, 0.1)' : 'none',
  });

  return (
    <DragDropContext onDragEnd={onColomnDragEnd}>
      <Droppable droppableId="dropStages" direction="horizontal">
        {
          (provided, snapshot) => (
            <div
              className="c7n-piplineManage-edit"
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {renderColumn()}
              {provided.placeholder}
            </div>
          )
        }
      </Droppable>
    </DragDropContext>
  );
});
