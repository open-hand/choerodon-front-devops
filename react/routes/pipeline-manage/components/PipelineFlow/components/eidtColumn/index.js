import React, { useEffect, Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui';
import {
  Modal, Form, TextField, Select, SelectBox, Icon,
} from 'choerodon-ui/pro';
import { usePipelineStageEditStore } from '../stageEditBlock/stores';
import AddTask from '../../../PipelineCreate/components/AddTask';
import AddCDTask from '../../../PipelineCreate/components/AddCDTask';
import AddStage from './AddStage';
import { usePipelineCreateStore } from '../../../PipelineCreate/stores';
import ViewVariable from '../../../view-variables';
import StageType from '../stage-type';

import './index.less';

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
const modalStyle = {
  width: 380,
};

const EditItem = (props) => {
  const {
    index,
    sequence,
    edit,
    jobDetail,
    PipelineCreateFormDataSet,
    AppServiceOptionsDs,
    appServiceName,
    image,
    openVariableModal,
    stageType,
    appServiceCode,
    witchColumnJobIndex,
    columnIndex,
  } = props;

  const { name, type } = jobDetail;

  const {
    editBlockStore, stepStore,
  } = usePipelineStageEditStore();

  const {
    editJob, removeStepTask, getStepData2,
  } = editBlockStore || stepStore;

  function handleEditOk(data) {
    editJob(sequence, index, data, edit);
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
          appServiceId={!edit && appServiceName}
          appServiceName={!edit && appServiceName}
          handleOk={handleEditOk}
          PipelineCreateFormDataSet={edit && PipelineCreateFormDataSet}
          AppServiceOptionsDs={edit && AppServiceOptionsDs}
          image={image}
          columnIndex={columnIndex}
          witchColumnJobIndex={witchColumnJobIndex}
        />
      ) : (
        <AddCDTask
          random={Math.random()}
          jobDetail={jobDetail}
          pipelineStageMainSource={getStepData2}
          appServiceId={!edit && appServiceName}
          appServiceName={!edit && appServiceName}
          PipelineCreateFormDataSet={edit && PipelineCreateFormDataSet}
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
      onOk: () => removeStepTask(sequence, index, edit),
    });
  }

  return (
    <div className="c7n-piplineManage-edit-column-item">
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

export default observer((props) => {
  const {
    jobList,
    sequence,
    name,
    columnIndex,
    edit,
    appServiceId,
    appServiceName,
    image,
    type,
    parallel,
    triggerType: stageTriggerType,
    appServiceCode,
    appServiceType,
    nextStageType,
    stagesSource,
  } = props;

  const witchColumnJobIndex = stagesSource && stagesSource[columnIndex]?.jobList.length;

  const {
    addStepDs,
    editBlockStore, stepStore,
    projectId,
  } = usePipelineStageEditStore();

  const {
    addNewStep,
    removeStep,
    eidtStep,
    newJob,
    getStepData,
    getStepData2,
  } = editBlockStore || stepStore;

  const stageLength = edit ? getStepData2.length : getStepData.length;

  let PipelineCreateFormDataSet;
  let AppServiceOptionsDs;
  try {
    PipelineCreateFormDataSet = usePipelineCreateStore().PipelineCreateFormDataSet;
    AppServiceOptionsDs = usePipelineCreateStore().AppServiceOptionsDs;
  } catch (e) {
    window.console.log(e);
  }

  async function createNewStage(firstIf) {
    const res = await addStepDs.validate();
    if (res) {
      // const a = addStepDs.toData()[0];
      addNewStep(firstIf ? -1 : columnIndex, addStepDs.toData()[0], edit);
      addStepDs.reset();
      return true;
    }
    return false;
  }

  // eslint-disable-next-line consistent-return
  async function editStage() {
    if (addStepDs.current && addStepDs.current.validate()) {
      eidtStep(sequence, addStepDs.current.get('step'), addStepDs.current.get('type'), true);
    } else {
      return false;
    }
    addStepDs.reset();
  }

  const renderStepTasks = () => (
    jobList && jobList.length > 0 ? (
      <div className="c7n-piplineManage-edit-column-lists">
        {
          jobList.slice().map((item, index) => (
            <EditItem
              index={index}
              witchColumnJobIndex={witchColumnJobIndex}
              columnIndex={columnIndex + 1}
              sequence={sequence}
              key={Math.random()}
              edit={edit}
              appServiceId={appServiceId}
              appServiceName={appServiceName}
              appServiceCode={appServiceCode}
              AppServiceOptionsDs={edit && AppServiceOptionsDs}
              PipelineCreateFormDataSet={edit && PipelineCreateFormDataSet}
              jobDetail={item}
              image={image}
              openVariableModal={openVariableModal}
              stageType={type || 'CI'}
            />
          ))
        }
      </div>
    ) : null
  );

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
      children: <AddStage
        projectId={projectId}
        curType={curType}
        optType={optType}
        addStepDs={addStepDs}
        appServiceType={optType === 'create' ? appServiceType : null}
        firstIf={firstIf}
        appServiceId={appServiceId}
        nextStageType={nextStageType}
      />,
      onOk: optsFun,
      onCancel: () => addStepDs.reset(),
    });
  };

  function deleteStep() {
    Modal.open({
      title: `删除${name}阶段`,
      children: '确认删除此阶段吗？',
      key: Modal.key(),
      onOk: () => removeStep(sequence, edit),
    });
  }

  function hanleStepCreateOk(data) {
    newJob(sequence, data, edit);
  }

  function openVariableModal() {
    Modal.open({
      key: Modal.key(),
      style: modalStyle,
      drawer: true,
      title: '查看变量配置',
      children: <ViewVariable
        appServiceId={appServiceId}
      />,
      okCancel: false,
      okText: '关闭',
    });
  }

  function openNewTaskModal() {
    Modal.open({
      key: Modal.key(),
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="c7n-piplineManage-edit-title-text">添加任务</span>
          {
            type === 'CI' && (
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
      children: type === 'CI' ? (
        <AddTask
          PipelineCreateFormDataSet={edit && PipelineCreateFormDataSet}
          AppServiceOptionsDs={edit && AppServiceOptionsDs}
          handleOk={hanleStepCreateOk}
          appServiceId={appServiceName}
          appServiceName={appServiceName}
          image={image}
          columnIndex={columnIndex + 1}
          witchColumnJobIndex={witchColumnJobIndex + 1}
        />
      ) : (
        <AddCDTask
          random={Math.random()}
          appServiceId={appServiceName}
          appServiceName={appServiceName}
          appServiceCode={appServiceCode}
          pipelineStageMainSource={getStepData2}
          PipelineCreateFormDataSet={edit && PipelineCreateFormDataSet}
          handleOk={hanleStepCreateOk}
          columnIndex={columnIndex + 1}
          witchColumnJobIndex={witchColumnJobIndex + 1}
        />
      ),
      style: {
        width: '740px',
      },
      drawer: true,
      okText: '添加',
    });
  }

  const realType = type?.toUpperCase();

  return [
    columnIndex === 0 && (
    <Button
      className="extra-addbutton"
      funcType="raised"
      icon="add"
      shape="circle"
      size="small"
      onClick={() => openAddStageModal({ optType: 'create', curType: type, firstIf: true })}
    />
    ),
    <div
      className="c7n-piplineManage-edit-column"
      style={{
        background: type === 'CI' ? 'rgba(245, 246, 250, 1)' : 'rgba(245,248,250,1)',
      }}
    >
      <div className="c7n-piplineManage-edit-column-header">
        <span>{name}</span>
        <span className={`c7n-piplineManage-stage-type c7n-piplineManage-stage-type-${realType}`}>
          {realType}
        </span>
        <div
          className="c7n-piplineManage-edit-column-header-btnGroup"
        >
          <Button
            funcType="raised"
            shape="circle"
            size="small"
            icon="mode_edit"
            onClick={
              () => openAddStageModal({ optType: 'edit', curType: type })
            }
            className="c7n-piplineManage-edit-column-header-btnGroup-btn"
          />
          {stageLength > 1 && (
          <Button
            funcType="raised"
            shape="circle"
            size="small"
            onClick={deleteStep}
            icon="delete_forever"
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
      {renderStepTasks()}
      <Button
        funcType="flat"
        icon="add"
        type="primary"
        onClick={openNewTaskModal}
        style={{ marginTop: '10px' }}
        disabled={PipelineCreateFormDataSet && !PipelineCreateFormDataSet.current.get('appServiceId')}
      >
        添加任务
      </Button>
      <Button
        funcType="raised"
        icon="add"
        shape="circle"
        size="small"
        className="c7n-piplineManage-edit-column-addBtn"
        onClick={() => openAddStageModal({ optType: 'create', curType: type })}
      />
      <div
        className="c7n-piplineManage-edit-column-arrow"
      >
        <span />
        <span />
      </div>
    </div>,
  ];
});
