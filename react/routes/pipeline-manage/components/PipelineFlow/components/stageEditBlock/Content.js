/* eslint-disable max-len */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { message } from 'choerodon-ui';
import {
  Droppable, Draggable, DragDropContext,
} from 'react-beautiful-dnd';
import EditColumn from '../eidtColumn';
import { usePipelineStageEditStore } from './stores';
import Loading from '../../../../../../components/loading';

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
    projectId,
    pipelineId,
    editBlockStore,
    stepStore,
    edit,
    appServiceId,
    appServiceName,
    appServiceCode,
    appServiceType,
    image,
    dataSource: propsDataSource,
  } = usePipelineStageEditStore();

  const {
    setStepData,
    getStepData,
    getStepData2,
    getLoading,
    editStepLists,
  } = editBlockStore || stepStore;

  useEffect(() => {
    let stageList = [];
    if (appServiceId && appServiceType === 'test') {
      stageList = [...defaultData.slice(0, 1)];
    } else {
      stageList = [...defaultData];
    }
    if (propsDataSource) {
      stageList = [...propsDataSource.stageList];
    }
    setStepData(stageList, edit);
  }, [appServiceId]);

  function renderColumn() {
    const dataSource = edit ? getStepData2 : getStepData;
    if (dataSource && dataSource.length > 0) {
      return dataSource.map((item, index) => {
        const nextStageType = dataSource[index + 1]?.type && dataSource[index + 1]?.type.toUpperCase();
        return (
          <Draggable key={`dropStages-${item.id}`} draggableId={`dropStages-${item.id}`} index={index}>
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
                  edit={edit}
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
    const sourceType = getStepData2[source.index]?.type;
    const destType = getStepData2[destination.index]?.type;
    if (sourceType !== destType) {
      message.error('CI阶段必须在CD阶段之后');
      return;
    }
    const arr = [...swap(getStepData2, source.index, destination.index)];
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

  function renderBlock() {
    if (edit) {
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
    }
    return (
      !getLoading && !edit ? (
        <div className="c7n-piplineManage-edit">
          {renderColumn()}
        </div>
      ) : <Loading display={getLoading} />
    );
  }

  return renderBlock();
});
