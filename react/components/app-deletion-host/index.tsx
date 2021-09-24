import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import isEmpty from 'lodash/isEmpty';
import { hostApi } from '@/api';
import { openPipelineReferenceModal } from '../app-deletion-with-vertification-code';

const deletionKey = Modal.key();

async function openDeleteHostAppModal(
  hostId: string,
  appId: string,
  appName: string,
  callback?:CallableFunction,
) {
  async function deleteHostApp() {
    try {
      const res = await hostApi.jarDelete(hostId, appId);
      if (res && res?.failed) {
        return res;
      }
      typeof callback === 'function' && callback();
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }
  const resOfPipeline = await hostApi.checkAppPipelineLinked(hostId);
  if (!isEmpty(resOfPipeline)) {
    openPipelineReferenceModal({
      active: 'delete',
      hasPipelineReference: resOfPipeline,
      instanceName: appName,
    });
  } else {
    Modal.open({
      key: deletionKey,
      title: '删除应用',
      children: '确认删除此应用吗？',
      okText: '删除',
      onOk: deleteHostApp,
    });
  }
}

export default openDeleteHostAppModal;
