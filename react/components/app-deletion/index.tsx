/* eslint-disable max-len */
import { axios } from '@choerodon/master';
import { isEmpty, findIndex } from 'lodash';
import { Modal } from 'choerodon-ui/pro';
import React from 'react';
import { FormattedMessage } from 'react-intl';

type openDeleteProps = {
  envId:string
  instanceId:string
  instanceName:string
  callback:(...args:any[])=>any
  projectId:string
}

type activeType = 'stop' | 'start' | 'delete';

const stopKey = Modal.key();
const stopKey2 = Modal.key();

async function checkPipelineReference({ projectId, instanceId }:Pick<openDeleteProps, 'projectId' | 'instanceId'>) {
  try {
    const res = await axios.get(`/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/pipeline_reference`);
    if (res && res.pipelineName) {
      return res;
    }
    // 实例没有关联的应用流水线时返回false
    return false;
  } catch (e) {
    return false;
  }
}

function openPipelineReferenceModal({
  active, hasPipelineReference, instanceName,
}:{
  active: activeType,
  instanceName:string,
  hasPipelineReference:any
}) {
  Modal.open({
    movable: false,
    closable: false,
    key: stopKey2,
    title: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.title`} values={{ name: instanceName }} />,
    children: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.no.tips`} values={{ ...hasPipelineReference }} />,
    okCancel: false,
    okText: <FormattedMessage id="iknow" />,
  });
}

function openDeleteModal({
  envId, instanceId, type, callback, instanceName,
}:Omit<openDeleteProps, 'projectId'> & { type: string}) {
  const newDeleteArr = [...this.deleteArr];

  const currentIndex = findIndex(newDeleteArr, (item:any) => instanceId === item.deleteId && type === item.type);

  if (currentIndex > -1) {
    const newItem = {
      ...newDeleteArr[currentIndex],
      display: true,
      refresh: callback,
    };
    newDeleteArr.splice(currentIndex, 1, newItem);
  } else {
    const newItem = {
      display: true,
      deleteId: instanceId,
      name: instanceName,
      type,
      refresh: callback,
      envId,
    };
    newDeleteArr.push(newItem);
  }
  this.setDeleteArr(newDeleteArr);
}

async function openDelete({
  envId, instanceName, instanceId, callback, projectId,
}:openDeleteProps) {
  const hasPipelineReference = await checkPipelineReference({
    instanceId, projectId,
  });

  if (!isEmpty(hasPipelineReference)) {
    openPipelineReferenceModal({ active: 'delete', hasPipelineReference, instanceName });
  } else {
    openDeleteModal({
      envId, instanceId, type: 'instance', callback, instanceName,
    });
  }
}

export {
  openDelete,
};
