import React, {
  createContext, useContext,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router';
import {
  CHART_CATERGORY,
  DEPLOY_TYPE,
} from './CONST';

import {
  openDelete,
  useAppDeletionWithVertificationStore,
  AppDeletionWithVertificationStoreProps,
} from '@/components/app-deletion-with-vertification-code';
import { appTypes } from '@/components/app-deletion-with-vertification-code/interface';

type deletEnvProps ={
  appCatergoryCode:string,
  envId:string,
  type?: appTypes
  appId:string
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

  // 删除chart和部署组的
  async function deleteEnvApp({
    appCatergoryCode, envId, instanceId, instanceName, callback, appId,
  }:deletEnvProps) {
    const appType = appCatergoryCode === CHART_CATERGORY ? 'instance' : 'deployGroup';
    openDelete({
      envId,
      instanceId,
      instanceName,
      callback,
      deletionStore,
      type: appType,
      appId,
    });
  }

  const value = {
    ...props,
    prefixCls: 'c7ncd-app-center',
    intlPrefix: 'c7ncd.appCenter',
    formatMessage,
    mainTabKeys,
    deletionStore,
    deleteEnvApp,
    goBackHomeBaby,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
