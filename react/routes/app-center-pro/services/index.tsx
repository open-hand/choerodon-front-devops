import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'choerodon-ui/pro';
import { deploymentsApi } from '@/api/Deployments';
import { CHART_CATERGORY } from '../stores/CONST';
import { openChangeActive } from '@/components/app-status-toggle';

type activeStatus = 'stop' | 'start'

type toggleDeployGroupStatusModalOpen = {
  active:activeStatus
  name: string
  instanceId: string | number
  refresh:(...args:any[])=>any
}

type toggleDataProps ={
  appCatergoryCode:string
  active: activeStatus
  name:string
  refresh:(...args:any[])=>any
  envId:string
  instanceId:string
  projectId:string
}

class AppCenterProServices {
  static async toggleDeployGroupStatus({
    active,
    instanceId,
    refresh,
  }:Pick<toggleDeployGroupStatusModalOpen, 'active' |'instanceId' |'refresh'>) {
    try {
      const res = await deploymentsApi.toggleDeployStatus(instanceId, active);
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
  }:toggleDeployGroupStatusModalOpen) {
    Modal.open({
      key: Modal.key(),
      title: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.title`} values={{ name }} />,
      children: <FormattedMessage id={`c7ncd.deployment.instance.action.${active}.tips`} />,
      onOk: () => this.toggleDeployGroupStatus({ active, instanceId, refresh }),
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
    });
  }
}

export default AppCenterProServices;
