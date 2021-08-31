import React, {
  createContext, useContext,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { axios } from '@choerodon/master';
import { useHistory, useLocation } from 'react-router';
import { Modal } from 'choerodon-ui/pro';
import {
  CHART_CATERGORY,
  DEPLOY_TYPE, ENV_TAB,
} from './CONST';

import useDeletionStore, { StoreProps } from './deletionStore';
import { hostApi } from '@/api';
import { openDelete } from '../components/app-deletion';
import { deploymentsApi } from '@/api/Deployments';

type deletEnvProps ={
  appCatergoryCode:string,
  envId:string,
  instanceId:string,
  instanceName:string,
  callback:(...args:[])=>any,
}

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  getAppCategories:(
    rdupmType:string,
    deployType:string
  ) => {name:string, code:string}
  mainTabKeys: {
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  }
  deletionStore: StoreProps
  match:any
  deleteHostApp: (hostId:string, instanceId:string, callback?:CallableFunction) => any
  deleteEnvApp: (props:deletEnvProps)=>any
  goBackHomeBaby: (...args:any[])=>any
}

const Store = createContext({} as ContextProps);

export function useAppCenterProStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = props;

  const mainTabKeys = DEPLOY_TYPE;

  const history = useHistory();
  const location = useLocation();

  // 专门针对环境的应用删除的弹窗
  const deletionStore = useDeletionStore();

  function goBackHomeBaby() {
    history.push({ pathname: '/devops/application-center', search: location.search });
  }

  async function deleteHostApp(hostId: string, instanceId: string, callback?:CallableFunction) {
    try {
      const res = await hostApi.jarDelete(hostId, instanceId);
      if (res && res?.failed) {
        return res;
      }
      typeof callback === 'function' && callback();
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }

  async function deleteDeployGroupApp({
    instanceId, callback,
  }:{
    instanceId:string,
    callback:(...args:[])=>any
  }) {
    try {
      const res = await deploymentsApi.deleleDeployGroupApp(instanceId);
      if (res && res.failed) {
        return res;
      }
      callback();
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  function openDeleteGroupModal({
    instanceId, callback,
  }:{
    instanceId:string,
    callback:(...args:[])=>any
  }) {
    Modal.open({
      key: Modal.key(),
      title: '删除应用',
      children: '确认删除此应用吗？',
      okText: '删除',
      onOk: () => deleteDeployGroupApp({ instanceId, callback }),
    });
  }

  async function deleteEnvApp({
    appCatergoryCode, envId, instanceId, instanceName, callback,
  }:deletEnvProps) {
    if (appCatergoryCode === CHART_CATERGORY) {
      openDelete({
        envId, instanceId, instanceName, callback, projectId, deletionStore,
      });
    } else {
      openDeleteGroupModal({
        instanceId, callback,
      });
    }
  }

  const value = {
    ...props,
    prefixCls: 'c7ncd-app-center',
    intlPrefix: 'c7ncd.appCenter',
    formatMessage,
    mainTabKeys,
    deletionStore,
    deleteHostApp,
    deleteEnvApp,
    goBackHomeBaby,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
