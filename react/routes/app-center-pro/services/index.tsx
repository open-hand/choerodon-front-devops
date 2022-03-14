import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'choerodon-ui/pro';
import {
  devopsHostsApi,
} from '@choerodon/master';
import { deploymentsApi } from '@/api/Deployments';
import { CHART_CATERGORY, DOCKER_CATEGORY } from '../stores/CONST';
import { openChangeActive } from '@/components/app-status-toggle';

type activeStatus = 'stop' | 'start'

type toggleDeployGroupStatusModalOpen = {
  active:activeStatus
  name: string
  instanceId: string | number
  refresh:(...args:any[])=>any
  appCatergoryCode?: string,
}

type toggleDataProps ={
  appCatergoryCode:string
  active: activeStatus
  name:string
  refresh:(...args:any[])=>any
  envId:string
  instanceId:string
  projectId:string
  hostId?: string,
}

class AppCenterProServices {
  static async toggleDeployGroupStatus({
    active,
    instanceId,
    refresh,
    appCatergoryCode,
    hostId,
  }: any) {
    try {
      let res;
      if (appCatergoryCode === DOCKER_CATEGORY) {
        res = await devopsHostsApi.stopDocker(hostId, instanceId);
      } else {
        res = await deploymentsApi.toggleDeployStatus(instanceId, active);
      }
      if (res && res.failed) {
        return false;
      }
      setTimeout(() => {
        refresh();
      }, 300);
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  static toggleDeployGroupStatusModalOpen({
    active,
    name,
    instanceId,
    refresh,
    appCatergoryCode,
    hostId,
  }:any) {
    Modal.open({
      key: Modal.key(),
      title: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.title`} values={{ name }} />,
      children: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.tips`} />,
      onOk: () => this.toggleDeployGroupStatus({
        active, instanceId, refresh, appCatergoryCode, hostId,
      }),
    });
  }

  // 启用停用操作入口
  static toggleActive({
    active,
    appCatergoryCode,
    name,
    refresh,
    envId,
    instanceId,
    projectId,
    hostId,
  }:toggleDataProps) {
    if (appCatergoryCode === CHART_CATERGORY) {
      return openChangeActive({
        active,
        name,
        callback: refresh,
        projectId,
        envId,
        instanceId,
      });
    }
    return this.toggleDeployGroupStatusModalOpen({
      active,
      name,
      instanceId,
      refresh,
      appCatergoryCode,
      hostId,
    });
  }
}

export default AppCenterProServices;
