import React, { createRef } from 'react';
import {
  Modal, Icon, Button,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { usePipelineStageEditStore } from '../../stores';
import AddTask from '../../../AddTask';
import AddCDTask from '../../../AddCDTask';

const jobTask = {
  build: '构建',
  sonar: '代码检查',
  custom: '自定义',
  chart: '发布Chart',
  cdDeploy: '部署',
  cdHost: '主机部署',
  cdAudit: '人工卡点',
  cdApiTest: 'API测试',
};

const EditItem = (props) => {
  const {
    index,
    sequence,
    jobDetail,
    PipelineCreateFormDataSet,
    AppServiceOptionsDs,
    appServiceName,
    image,
    openVariableModal,
    stageType,
    witchColumnJobIndex,
    columnIndex,
    innerRef,
    dragProvided,
    snapshotinner,
  } = props;

  const { name, type } = jobDetail;

  const {
    editBlockStore,
  } = usePipelineStageEditStore();

  const {
    editJob, removeStepTask, getStepData,
  } = editBlockStore;

  function handleEditOk(data) {
    editJob(sequence, index, data);
  }

  function openEditJobModal() {
    Modal.open({
      key: Modal.key(),
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="c7n-piplineManage-edit-title-text">{`编辑${name}任务`}</span>
          {
            stageType === 'CI' && (
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
            )
          }
        </div>
      ),
      style: {
        width: '740px',
      },
      children: stageType === 'CI' ? (
        <AddTask
          jobDetail={jobDetail}
          handleOk={handleEditOk}
          appServiceId={appServiceName}
          appServiceName={appServiceName}
          PipelineCreateFormDataSet={PipelineCreateFormDataSet}
          AppServiceOptionsDs={AppServiceOptionsDs}
          image={image}
          columnIndex={columnIndex}
          witchColumnJobIndex={witchColumnJobIndex}
        />
      ) : (
        <AddCDTask
          random={Math.random()}
          jobDetail={jobDetail}
          appServiceId={appServiceName}
          appServiceName={appServiceName}
          pipelineStageMainSource={getStepData}
          PipelineCreateFormDataSet={PipelineCreateFormDataSet}
          handleOk={handleEditOk}
          columnIndex={columnIndex}
          witchColumnJobIndex={witchColumnJobIndex}
        />
      ),

      drawer: true,
      okText: '添加',
    });
  }

  function openDeleteJobModal() {
    Modal.open({
      key: Modal.key(),
      title: `删除${name}任务`,
      children: '确认删除此任务吗？',
      okText: '确认',
      onOk: () => removeStepTask(sequence, index),
    });
  }

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // styles we need to apply on draggables
    ...draggableStyle,
    cursor: 'all-scroll',
  });

  return (
    <div
      className="c7n-piplineManage-edit-column-item"
      ref={innerRef}
      {...dragProvided.draggableProps}
      {...dragProvided.dragHandleProps}
      style={getItemStyle(
        snapshotinner.isDragging,
        dragProvided.draggableProps.style,
      )}
    >
      <div className="c7n-piplineManage-edit-column-item-header">
        【
        {Object.prototype.hasOwnProperty.bind(jobTask, type) && jobTask[type]}
        】
        {name}
      </div>
      <div className="c7n-piplineManage-edit-column-item-btnGroup">
        <Button
          className="c7n-piplineManage-edit-column-item-btnGroup-btn"
          shape="circle"
          size="small"
          icon="mode_edit"
          onClick={openEditJobModal}
        />
        <Button
          className="c7n-piplineManage-edit-column-item-btnGroup-btn"
          shape="circle"
          size="small"
          icon="delete_forever"
          onClick={openDeleteJobModal}
        />
      </div>
    </div>
  );
};

export default observer(EditItem);
