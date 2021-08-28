/* eslint-disable max-len */
import { axios } from '@choerodon/master';
import { isEmpty, findIndex } from 'lodash';
import { Modal } from 'choerodon-ui/pro';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { StoreProps } from '@/routes/app-center-pro/stores/deletionStore';
import { appServiceInstanceApi } from '@/api';

type openDeleteProps = {
  envId:string
  instanceId:string
  instanceName:string
  callback:(...args:any[])=>any
  projectId:string
  deletionStore:StoreProps
}

type activeType = 'stop' | 'start' | 'delete';

const stopKey2 = Modal.key();

async function checkPipelineReference({ instanceId }:Pick<openDeleteProps, 'instanceId'>) {
  try {
    const res = await appServiceInstanceApi.checkPipelineReference(instanceId);
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

async function openDelete({
  envId, instanceName, instanceId, callback, projectId, deletionStore,
}:openDeleteProps) {
  const hasPipelineReference = await checkPipelineReference({
    instanceId,
  });
  if (!isEmpty(hasPipelineReference)) {
    openPipelineReferenceModal({ active: 'delete', hasPipelineReference, instanceName });
  } else {
    deletionStore.openDeleteModal({
      envId, instanceId, type: 'instance', callback, instanceName,
    });
  }
}

export {
  openDelete,
};
