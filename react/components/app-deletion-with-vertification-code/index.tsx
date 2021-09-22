/* eslint-disable max-len */
import { isEmpty } from 'lodash';
import { Modal } from 'choerodon-ui/pro';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { AppDeletionWithVertificationStoreProps } from '@/components/app-deletion-with-vertification-code/deletionStore';
import { appServiceInstanceApi } from '@/api';

export { default as AppDeletionsModal } from './components/delete-modal';

type openDeleteProps = {
  envId:string
  instanceId:string
  instanceName:string
  callback:(...args:any[])=>any
  projectId:string
  deletionStore:AppDeletionWithVertificationStoreProps
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

// deletionStore 可以从app-deletion-with-vertification-code组件下的deletionStore
// 这个模板里头拿，直接new deletionStore它就行
async function openDelete({
  envId, instanceName, instanceId, callback, projectId, deletionStore,
}:openDeleteProps) {
  const hasPipelineReference = await checkPipelineReference({
    instanceId,
  });
  if (!isEmpty(hasPipelineReference)) {
    openPipelineReferenceModal({ active: 'delete', hasPipelineReference, instanceName });
  } else {
    if (!deletionStore?.openDeleteModal) {
      throw new Error('the openDeleteModal trigger needs openDeleteModal function in deletionStore');
    }
    deletionStore.openDeleteModal({
      envId, instanceId, type: 'instance', callback, instanceName,
    });
  }
}

export * from './deletionStore';

export {
  openDelete,
};
