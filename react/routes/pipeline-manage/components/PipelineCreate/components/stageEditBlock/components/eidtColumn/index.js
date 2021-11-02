import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Dropdown, Menu } from 'choerodon-ui';
import { Modal, Icon } from 'choerodon-ui/pro';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { LARGE } from '@/utils/getModalWidth';
import jobTypes from '../../../../../../stores/jobsTypeMappings';
import { usePipelineStageEditStore } from '../../stores';
import AddTask from '../../../AddTask';
import AddCDTask from '../../../AddCDTask';
import AddStage from '../AddStage';
import { usePipelineCreateStore } from '../../../../stores';
import ViewVariable from '../../../../../view-variables';
import EditItem from './EditItem';

import './index.less';

const modalStyle = {
  width: 380,
};
const { SubMenu } = Menu;

export default observer((props) => {
  const {
    jobList,
    sequence,
    name,
    columnIndex,
    appServiceId,
    appServiceName,
    image,
    type,
    parallel,
    appServiceCode,
    appServiceType,
    nextStageType,
    stagesSource,
    innerRef,
    dragProvided,
    snapshotinner,
  } = props;

  const witchColumnJobIndex = stagesSource && stagesSource[columnIndex]?.jobList.length;

  const {
    addStepDs,
    editBlockStore,
    stepStore,
    projectId,
  } = usePipelineStageEditStore();

  const {
    addNewStep,
    removeStep,
    eidtStep,
    newJob,
    getStepData,
    editJobLists,
  } = editBlockStore || stepStore;

  const stageLength = getStepData.length;

  let PipelineCreateFormDataSet;
  let AppServiceOptionsDs;
  try {
    PipelineCreateFormDataSet = usePipelineCreateStore()
      .PipelineCreateFormDataSet;
    AppServiceOptionsDs = usePipelineCreateStore().AppServiceOptionsDs;
  } catch (e) {
    window.console.log(e);
  }

  async function createNewStage(firstIf) {
    const res = await addStepDs.validate();
    if (res) {
      // const a = addStepDs.toData()[0];
      addNewStep(firstIf ? -1 : columnIndex, addStepDs.toData()[0]);
      addStepDs.reset();
      return true;
    }
    return false;
  }

  // eslint-disable-next-line consistent-return
  async function editStage() {
    if (addStepDs.current && addStepDs.current.validate()) {
      eidtStep(
        sequence,
        addStepDs.current.get('step'),
        addStepDs.current.get('type'),
        true,
      );
    } else {
      return false;
    }
    addStepDs.reset();
  }

  function swap(arr, from, to) {
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    return arr;
  }

  const onTaskDragEnd = (data) => {
    const { source, destination } = data;
    if (!destination) {
      return;
    }
    const arr = [...swap(jobList, source.index, destination.index)];
    editJobLists(sequence, type, arr);
  };

  const getListStyle = (isDraggingOver) => ({
    border: isDraggingOver ? '2px dotted #5266d4' : 'none',
    borderRadius: isDraggingOver ? '3px' : '0',
    padding: '2px',
    background: isDraggingOver ? 'rgba(82, 102, 212, 0.1)' : 'none',
  });

  const renderStepTasks = () => (jobList && jobList.length > 0 ? (
    <DragDropContext onDragEnd={onTaskDragEnd}>
      <Droppable droppableId={`dropJobs-${sequence}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="c7n-piplineManage-edit-column-lists"
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {jobList.slice().map((item, index) => (
              <Draggable
                key={`dropJobs-${item.name}`}
                draggableId={`dropJobs-${item.name}`}
                index={index}
              >
                {(dragProvidedByColomn, snapshotinnerByJob) => (
                  <EditItem
                    snapshotinner={snapshotinnerByJob}
                    innerRef={dragProvidedByColomn.innerRef}
                    dragProvided={dragProvidedByColomn}
                    index={index}
                    witchColumnJobIndex={witchColumnJobIndex}
                    columnIndex={columnIndex + 1}
                    sequence={sequence}
                    appServiceId={appServiceId}
                    appServiceName={appServiceName}
                    appServiceCode={appServiceCode}
                    AppServiceOptionsDs={AppServiceOptionsDs}
                    PipelineCreateFormDataSet={PipelineCreateFormDataSet}
                    jobDetail={item}
                    image={image}
                    openVariableModal={openVariableModal}
                    stageType={type || 'CI'}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  ) : null);

  const openAddStageModal = ({ optType, curType, firstIf = false }) => {
    const title = optType === 'create' ? '添加阶段' : '修改阶段信息';
    const okText = optType === 'create' ? '添加' : '修改';
    if (optType === 'edit') {
      addStepDs.current.set('step', name);
      addStepDs.current.set('type', curType || 'CI');
    }
    const optsFun = optType === 'create' ? () => createNewStage(firstIf) : editStage;
    Modal.open({
      key: Modal.key(),
      title,
      drawer: true,
      style: {
        width: 380,
      },
      okText,
      children: (
        <AddStage
          stageName={name}
          projectId={projectId}
          curType={curType}
          optType={optType}
          addStepDs={addStepDs}
          appServiceType={optType === 'create' ? appServiceType : null}
          firstIf={firstIf}
          appServiceId={appServiceId}
          nextStageType={nextStageType}
        />
      ),
      onOk: optsFun,
      onCancel: () => addStepDs.reset(),
    });
  };

  const deleteStep = () => {
    Modal.open({
      title: `删除${name}阶段`,
      children: '确认删除此阶段吗？',
      key: Modal.key(),
      onOk: () => removeStep(sequence),
    });
  };

  const hanleStepCreateOk = (data) => {
    newJob(sequence, data);
  };

  function openVariableModal() {
    Modal.open({
      key: Modal.key(),
      style: modalStyle,
      drawer: true,
      title: '查看变量配置',
      children: <ViewVariable appServiceId={appServiceId} />,
      okCancel: false,
      okText: '关闭',
    });
  }

  const renderNewTaskModalChildren = (taskType) => {
    let modalChildren;
    if (type === 'CI') {
      modalChildren = (
        <AddTask
          PipelineCreateFormDataSet={PipelineCreateFormDataSet}
          AppServiceOptionsDs={AppServiceOptionsDs}
          handleOk={hanleStepCreateOk}
          taskType={taskType}
          appServiceId={appServiceName}
          appServiceName={appServiceName}
          stageName={name}
          image={image}
          columnIndex={columnIndex + 1}
          witchColumnJobIndex={witchColumnJobIndex + 1}
        />
      );
    } else {
      modalChildren = (
        <AddCDTask
          random={Math.random()}
          stageName={name}
          appServiceId={appServiceName}
          appServiceName={appServiceName}
          appServiceCode={appServiceCode}
          pipelineStageMainSource={getStepData}
          PipelineCreateFormDataSet={PipelineCreateFormDataSet}
          handleOk={hanleStepCreateOk}
          taskType={taskType}
          columnIndex={columnIndex + 1}
          witchColumnJobIndex={witchColumnJobIndex + 1}
        />
      );
    }
    return modalChildren;
  };

  const menuSelect = ({ item, key, selectedKeys }) => {
    openNewTaskModal(key);
  };

  const CIMenu = (
    <Menu onClick={menuSelect}>
      <Menu.Item key="build">构建</Menu.Item>
      <Menu.Item key="sonar">代码检查</Menu.Item>
      <Menu.Item key="custom">自定义</Menu.Item>
      <Menu.Item key="chart">发布Chart</Menu.Item>
    </Menu>
  );
  const CDMenu = (
    <Menu onClick={menuSelect}>
      <SubMenu title="容器部署">
        <Menu.Item key="cdDeploy">Chart包</Menu.Item>
        <Menu.Item key="cdDeployment">部署组</Menu.Item>
      </SubMenu>
      <Menu.Item key="cdHost">主机部署</Menu.Item>
      <Menu.Item key="cdAudit">人工卡点</Menu.Item>
      <Menu.Item key="cdApiTest">API测试</Menu.Item>
      <Menu.Item key="cdExternalApproval">外部卡点</Menu.Item>
    </Menu>
  );

  function openNewTaskModal(taskType) {
    Modal.open({
      key: Modal.key(),
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="c7n-piplineManage-edit-title-text">
            {`添加【${jobTypes[taskType]}】任务`}
          </span>
          {type === 'CI' && (
            <div
              className="c7n-piplineManage-edit-title-text-btn"
              onClick={() => openVariableModal()}
              role="none"
            >
              <Icon
                type="find_in_page-o"
                className="c7n-piplineManage-edit-title-btn"
              />
              <span>查看流水线变量</span>
            </div>
          )}
        </div>
      ),
      children: renderNewTaskModalChildren(taskType),
      style: {
        width: LARGE,
      },
      drawer: true,
      okText: '添加',
    });
  }

  const realType = type?.toUpperCase();

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // styles we need to apply on draggables
    ...draggableStyle,
    cursor: 'unset',
    background:
      type === 'CI' ? 'rgba(245, 246, 250, 1)' : 'rgba(245,248,250,1)',
  });

  return [
    columnIndex === 0 && (
      <Button
        className="extra-addbutton"
        funcType="raised"
        icon="add"
        shape="circle"
        disabled={!appServiceId}
        size="small"
        onClick={() => openAddStageModal({ optType: 'create', curType: type, firstIf: true })}
      />
    ),
    <div
      className="c7n-piplineManage-edit-column"
      {...dragProvided.draggableProps}
      style={getItemStyle(
        snapshotinner.isDragging,
        dragProvided.draggableProps.style,
      )}
    >
      <div
        ref={innerRef}
        {...dragProvided.dragHandleProps}
        style={{
          cursor: 'all-scroll',
        }}
      >
        <div className="c7n-piplineManage-edit-column-header">
          <span>{name}</span>
          <span
            className={`c7n-piplineManage-stage-type c7n-piplineManage-stage-type-${realType}`}
          >
            {realType}
          </span>
          <div className="c7n-piplineManage-edit-column-header-btnGroup">
            <Button
              funcType="raised"
              shape="circle"
              size="small"
              icon="mode_edit"
              disabled={!appServiceId}
              onClick={() => openAddStageModal({ optType: 'edit', curType: type })}
              className="c7n-piplineManage-edit-column-header-btnGroup-btn"
            />
            {stageLength > 1 && (
              <Button
                funcType="raised"
                shape="circle"
                size="small"
                onClick={deleteStep}
                icon="delete_forever"
                disabled={!appServiceId}
                className="c7n-piplineManage-edit-column-header-btnGroup-btn c7n-piplineManage-edit-column-header-btnGroup-btn-delete"
              />
            )}
          </div>
        </div>
        <div className="c7n-piplineManage-edit-column-stageType">
          <span>任务列表</span>
          {/* Todo 加上串并行逻辑后优化判断 */}
          <span
            className={`c7n-piplineManage-stage-type-task c7n-piplineManage-stage-type-task-${parallel || realType === 'CI' ? 'parallel' : 'serial'}`}
          >
            {parallel || realType === 'CI' ? '任务并行' : '任务串行'}
          </span>
        </div>
      </div>
      {renderStepTasks()}
      <Dropdown
        overlay={realType === 'CI' ? CIMenu : CDMenu}
        trigger={['click']}
        disabled={PipelineCreateFormDataSet && !appServiceId}
      >
        <Button
          funcType="flat"
          icon="add"
          type="primary"
          style={{ marginTop: '10px' }}
        >
          添加任务
        </Button>
      </Dropdown>

      <Button
        funcType="raised"
        icon="add"
        shape="circle"
        size="small"
        disabled={!appServiceId}
        className="c7n-piplineManage-edit-column-addBtn"
        onClick={() => openAddStageModal({ optType: 'create', curType: type })}
      />
      <div className="c7n-piplineManage-edit-column-arrow">
        <span />
        <span />
      </div>
    </div>,
  ];
});
