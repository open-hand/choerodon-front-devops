/* eslint-disable max-len */
import React, {
  CSSProperties,
  FC,
  useEffect,
  useMemo,
} from 'react';
import { useFormatCommon } from '@choerodon/master';
import map from 'lodash/map';
import { Icon } from 'choerodon-ui/pro';

import './index.less';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import JobItem from '../job-item';
import JobAddBtn from '../job-btn';
import { STAGE_TYPES } from '../../../../interface';
import useStageModal from '../../hooks/useStageModal';
import { STAGE_CI } from '../../../../stores/CONSTANTS';
import useStageEdit from '../../hooks/useStageEdit';

export type StageProps = {
  type: STAGE_TYPES
  name: string
  jobList: any[]
  stageIndex:number
} & Record<string, any>

const prefixCls = 'c7ncd-pipeline-stage';

const Stage:FC<StageProps> = (props) => {
  const {
    type = STAGE_CI,
    name,
    jobList = [],
    stageIndex,

    fromToId,
    isDragging,
  } = props;

  const {
    editStage,
    deleteStage,

    deleteJob,
    addJob,
  } = useStageEdit();

  const formatCommon = useFormatCommon();

  const linesType = type === STAGE_CI ? 'paralle' : 'serial';

  /**
   * 编辑阶段的回调
   * @param {*} stageData
   */
  const handleStageEditOk = (stageData:any) => {
    editStage(stageIndex, stageData);
  };

  /**
   * 删除阶段的回调
   * @param {*} e
   */
  const handleDeleteStage = (e:any) => {
    e?.stopPropagation();
    deleteStage(stageIndex);
  };

  /** @type {*} 打开阶段编辑弹窗 */
  const handleModalOpen = useStageModal<{
    type: STAGE_TYPES
    name: string
  }>('edit', {
    initialValue: {
      type,
      name,
    },
    onOk: handleStageEditOk,
  });

  /**
   * 新增job的回调
   * @param {number} jobIndex
   * @param {*} jobData
   */
  const handleJobAddCallback = (jobData:any) => {
    const jobIndex = jobList.length;
    addJob(stageIndex, jobIndex, jobData);
  };

  /**
   * 删除job的回调
   * @param {number} jobIndex
   * @param {*} jobData
   */
  const handleJobDeleteCallback = (jobIndex:number) => {
    deleteJob(stageIndex, jobIndex);
  };

  const renderJobs = () => map(jobList, (item, index:number) => {
    const options = {
      handleJobDeleteCallback,
    };
    const data = {
      ...item,
      jobIndex: index, // job的index
      linesType,
      showLines: !isDragging,
    };
    return <JobItem {...data} {...options} key={item?.id} />;
  });

  const getItemStyle = (_isDragging:boolean, draggableStyle:CSSProperties, extra:CSSProperties) => ({
    userSelect: 'none',
    ...draggableStyle,
    ...extra,
    cursor: 'unset',
  });

  const getStageStyle = (isDraggingOver:boolean) => ({
    border: isDragging ? '1px dotted #5266d4' : 'none',
    borderRadius: isDragging ? '3px' : '0',
    background: isDragging ? 'rgba(82, 102, 212, 0.1)' : 'none',
    minWidth: 200,
  });

  const getTransfromStylesByFromToId = useMemo(() => {
    const [fromId, toId] = fromToId?.split('-').map(Number);
    let styles = {};
    if (String(stageIndex) !== String(fromId)) {
      styles = { transform: 'translate(0,0)' };
      const mul = toId - fromId;
      if (mul > 0) {
        if (stageIndex <= toId && stageIndex >= fromId) {
          styles = {
            transform: 'translate(-282px, 0)',
          };
        }
      } else if (stageIndex >= toId && stageIndex <= fromId) {
        styles = {
          transform: 'translate(282px, 0)',
        };
      }
    }
    return styles;
  }, [fromToId, stageIndex]);

  return (
    <Droppable droppableId={`stageDroppable-${stageIndex}`}>
      {(provided:any, snapshot:any) => (
        <div
          ref={provided.innerRef}
          style={getStageStyle(snapshot.isDraggingOver)}
          {...provided.droppableProps}
        >
          <Draggable draggableId={`draggable-${stageIndex}`} index={stageIndex}>
            {(draggableProvided:any, draggableSnapshot:any) => (
              <div
                className={prefixCls}
                ref={draggableProvided.innerRef}
                {...draggableProvided.draggableProps}
                {...draggableProvided.dragHandleProps}
                style={
                    getItemStyle(
                      draggableSnapshot.isDragging,
                      draggableProvided.draggableProps.style,
                      getTransfromStylesByFromToId,
                    )
                  }
              >
                <header onClick={handleModalOpen} role="none">
                  <div className={`${prefixCls}-stageType`}>{type}</div>
                  <div className={`${prefixCls}-stageName`}>{name}</div>
                  <div className={`${prefixCls}-btnGroups`}>
                    <Icon onClick={handleDeleteStage} type="delete_black-o" className={`${prefixCls}-btnGroups-delete`} />
                  </div>
                </header>
                <main>
                  {renderJobs()}
                </main>
                <footer>
                  <JobAddBtn handleJobAddCallback={handleJobAddCallback} linesType={linesType} type={jobList.length ? 'circle' : 'normal'} />
                </footer>
              </div>
            )}
          </Draggable>
        </div>
      )}
    </Droppable>
  );
};

export default Stage;
