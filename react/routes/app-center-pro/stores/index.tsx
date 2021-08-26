import React, {
  createContext, useContext,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { axios } from '@choerodon/master';
import { useHistory, useLocation } from 'react-router';
import {
  DEPLOY_TYPE,
} from './CONST';

import useDeletionStore, { StoreProps } from './deletionStore';

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

  function jarDelete(hostId: string, instanceId: string) {
    return axios.delete(`/devops/v1/projects/${projectId}/hosts/${hostId}/java_process/${instanceId}`);
  }

  function goBackHomeBaby() {
    history.push({ pathname: '/devops/application-center', search: location.search });
  }

  async function deleteHostApp(hostId: string, instanceId: string, callback?:CallableFunction) {
    try {
      const res = await jarDelete(hostId, instanceId);
      if (res && res?.failed) {
        return res;
      }
      typeof callback === 'function' && callback();
      return res;
    } catch (error) {
      throw new Error(error);
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
    goBackHomeBaby,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
