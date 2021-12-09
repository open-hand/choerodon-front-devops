import React, { createRef, useEffect, useMemo } from 'react';
import {
  Modal, Icon, Button, Tooltip,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { OverflowWrap } from '@choerodon/components';
import { LARGE } from '@/utils/getModalWidth';
import { usePipelineStageEditStore } from '../../stores';
import AddTask from '../../../AddTask';
import AddCDTask from '../../../AddCDTask';
import jobType from '../../../../../../stores/jobsTypeMappings';

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
    appServiceId,
  } = props;

  const { name, type, edit } = jobDetail;

  const prefixCls = 'c7n-piplineManage-edit-column-item';

  const { editBlockStore } = usePipelineStageEditStore();

  const { editJob, removeStepTask, getStepData } = editBlockStore;

  function handleEditOk(data) {
    editJob(sequence, index, data);
  }

  function openEditJobModal() {
    Modal.open({
      key: Modal.key(),
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="c7n-piplineManage-edit-title-text">{`编辑${name}任务`}</span>
          {stageType === 'CI' && (
            <div
              className="c7n-piplineManage-edit-title-text-btn"
              onClick={() => openVariableModal()}
              role="none"
            >
              <Icon type="find_in_page-o" className="c7n-piplineManage-edit-title-btn" />
              <span>查看流水线变量</span>
            </div>
          )}
        </div>
      ),
      style: {
        width: LARGE,
      },
      children:
        stageType === 'CI' ? (
          <AddTask
            jobDetail={jobDetail}
            appServiceId={appServiceName}
            appServiceName={appServiceName}
            PipelineCreateFormDataSet={PipelineCreateFormDataSet}
            AppServiceOptionsDs={AppServiceOptionsDs}
            image={image}
            columnIndex={columnIndex}
            witchColumnJobIndex={witchColumnJobIndex}
            sequence={sequence}
            index={index}
            // eslint-disable-next-line react/jsx-no-bind
            handleOk={handleEditOk}
          />
        ) : (
          <AddCDTask
            random={Math.random()}
            jobDetail={jobDetail}
            appServiceId={appServiceName}
            appServiceName={appServiceName}
            trueAppServiceId={appServiceId}
            pipelineStageMainSource={getStepData}
            columnIndex={columnIndex}
            witchColumnJobIndex={witchColumnJobIndex}
            sequence={sequence}
            index={index}
            // eslint-disable-next-line react/jsx-no-bind
            handleOk={handleEditOk}
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

  const isCdDisabled = useMemo(() => typeof edit === 'boolean' && !edit && stageType === 'CD', [
    edit,
    stageType,
  ]);

  const renderOptsBtn = () => {
    const toolText = '该用户没有部署任务对应的环境权限，无法修改';
    return (
      <>
        <Tooltip title={isCdDisabled && toolText}>
          <Button
            className={`${prefixCls}-btnGroup-btn`}
            disabled={isCdDisabled}
            shape="circle"
            size="small"
            icon="mode_edit"
            // eslint-disable-next-line react/jsx-no-bind
            onClick={openEditJobModal}
          />
        </Tooltip>
        <Tooltip>
          <Button
            className={`${prefixCls}-btnGroup-btn`}
            shape="circle"
            size="small"
            icon="delete_forever"
            // eslint-disable-next-line react/jsx-no-bind
            onClick={openDeleteJobModal}
          />
        </Tooltip>
      </>
    );
  };

  return (
    <div
      className={prefixCls}
      ref={innerRef}
      {...dragProvided.draggableProps}
      {...dragProvided.dragHandleProps}
      style={getItemStyle(snapshotinner.isDragging, dragProvided.draggableProps.style)}
    >
      <OverflowWrap className={`${prefixCls}-header`}>
        【
        {Object.prototype.hasOwnProperty.bind(jobType, type) && jobType[type]}
        】
        {name}
      </OverflowWrap>
      <div className={`${prefixCls}-btnGroup`}>{renderOptsBtn()}</div>
    </div>
  );
};

export default observer(EditItem);
