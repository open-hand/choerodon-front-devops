import React, {
  createContext, useContext,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router';
import { Modal } from 'choerodon-ui/pro';
import {
  CHART_CATERGORY,
  DEPLOY_TYPE, ENV_TAB,
} from './CONST';

import { hostApi } from '@/api';
import {
  openDelete,
  useAppDeletionWithVertificationStore,
  AppDeletionWithVertificationStoreProps,
} from '@/components/app-deletion-with-vertification-code';
import { deploymentsApi } from '@/api/Deployments';
import { appTypes } from '@/components/app-deletion-with-vertification-code/interface';

type deletEnvProps ={
  appCatergoryCode:string,
  envId:string,
  type?: appTypes
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
  deletionStore: AppDeletionWithVertificationStoreProps
  match:any
  openDeleteHostAppModal: (hostId:string, instanceId:string, callback?:CallableFunction) => any
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
  const deletionStore = useAppDeletionWithVertificationStore();

  function goBackHomeBaby() {
    history.push({ pathname: '/devops/application-center', search: location.search });
  }

  function openDeleteHostAppModal(hostId: string, instanceId: string, callback?:CallableFunction) {
    async function deleteHostApp() {
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
    Modal.open({
      key: Modal.key(),
      title: '删除应用',
      children: '确认删除此应用吗？',
      okText: '删除',
      onOk: deleteHostApp,
    });
  }

  // 删除chart和部署组的
  async function deleteEnvApp({
    appCatergoryCode, envId, instanceId, instanceName, callback,
  }:deletEnvProps) {
    const appType = appCatergoryCode === CHART_CATERGORY ? 'instance' : 'deployGroup';
    openDelete({
      envId,
      instanceId,
      instanceName,
      callback,
      deletionStore,
      type: appType,
    });
  }

  const value = {
    ...props,
    prefixCls: 'c7ncd-app-center',
    intlPrefix: 'c7ncd.appCenter',
    formatMessage,
    mainTabKeys,
    deletionStore,
    openDeleteHostAppModal,
    deleteEnvApp,
    goBackHomeBaby,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
