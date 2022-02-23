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
  appRecord?: any,
) {
  const params: any = {};
  const data = appRecord?.toData();
  const killCommandExist = data?.killCommandExist;
  let flag = false;
  const checkKillCommandExist = () => {
    if (!killCommandExist) {
      Modal.confirm({
        title: '未维护删除操作',
        children: '此应用当前暂未维护【删除操作】，请前往【修改应用】界面维护。',
        okText: '我知道了',
        okCancel: false,
      });
      flag = true;
    }
  };
  if (data?.rdupmType === 'docker') {
    params.host_deploy_type = 'image';
  } else if (data?.rdupmType === 'jar') {
    params.host_deploy_type = 'jar';
    checkKillCommandExist();
  } else {
    params.host_deploy_type = 'customize';
    checkKillCommandExist();
  }
  async function deleteHostApp() {
    try {
      const res = await hostApi.jarDelete(hostId, appId, params);
      if (res && res?.failed) {
        return res;
      }
      typeof callback === 'function' && callback();
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }
  if (!flag) {
    const resOfPipeline = await hostApi.checkAppPipelineLinked(appId);
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
}

export default openDeleteHostAppModal;
