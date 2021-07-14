import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import useStore, { StoreProps } from '@/routes/app-center/app-detail/stores/useStore';
import DetailDataSet from '@/routes/app-center/app-detail/stores/DetailDataSet';
import EnvOptionsDataSet from '@/routes/app-center/stores/EnvOptionsDataSet';
import { useAppCenterStore } from '@/routes/app-center/stores';
import { DataSet as DataSetProps } from '@/interface';
import SearchDataSet from '@/routes/app-center/app-detail/stores/SearchDataSet';
import HostOptionsDataSet from '@/routes/app-center/app-detail/stores/HostOptionsDataSet';
import useDeleteModalStore, { DeleteStoreProps } from './useDeleteModalStore';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tabKeys: {
    INSTANCE_TAB: 'instance',
    DEPLOYCONFIG_TAB: 'deployConfig',
    SERVICEANDINGRESS_TAB: 'serviceAndIngress',
    CONFIGMAP_TAB: 'configMap',
    SECRET_TAB: 'secret',
  }
  mainStore: StoreProps,
  detailDs: DataSetProps,
  searchDs: DataSetProps,
  appServiceType: 'project' | 'share' | 'market',
  appServiceId: string,
  deleteModalStore: DeleteStoreProps
  mainTabKeys: {
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  },
  hostTabKeys: {
    APP_INSTANCE_TAB: 'app_instance',
  }
}

const Store = createContext({} as ContextProps);

export function useAppCenterDetailStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
    match: { params: { id: appServiceId, type: appServiceType } },
  } = props;

  const {
    prefixCls,
    intlPrefix,
    formatMessage,
  } = useAppCenterStore();

  const tabKeys = useMemo(() => ({
    INSTANCE_TAB: 'instance',
    DEPLOYCONFIG_TAB: 'deployConfig',
    SERVICEANDINGRESS_TAB: 'serviceAndIngress',
    CONFIGMAP_TAB: 'configMap',
    SECRET_TAB: 'secret',
  }), []);

  const mainTabKeys = useMemo(() => ({
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  }), []);

  const hostTabKeys = useMemo(() => ({
    APP_INSTANCE_TAB: 'app_instance',
  }), []);

  const defaultTabKey = useMemo(() => tabKeys.INSTANCE_TAB, []);
  const defaultMainTabKey = useMemo(() => mainTabKeys.ENV_TAB, []);

  const mainStore = useStore({ defaultTabKey, defaultMainTabKey });

  const deleteModalStore = useDeleteModalStore();

  const detailDs = useMemo(() => new DataSet(DetailDataSet({
    projectId,
    appServiceId,
    appServiceType,
  })), [projectId, appServiceId, appServiceType]);
  const envDs = useMemo(() => new DataSet(EnvOptionsDataSet({ projectId })), [projectId]);
  const hostDs = useMemo(() => new DataSet(HostOptionsDataSet({ projectId })), [projectId]);
  const searchDs = useMemo(() => new DataSet(SearchDataSet({ envDs, hostDs })), []);

  const loadEnvData = useCallback(async () => {
    await envDs.query();
    const envRecord = envDs.get(0);
    if (envRecord) {
      const envData = envRecord.toData();
      searchDs.current?.set('env', envData);
      mainStore.setSelectedEnv(envData);
    }
  }, []);

  const loadHostData = useCallback(async () => {
    await hostDs.query();
    const hostRecord = hostDs.find((eachRecord) => eachRecord.get('hostStatus') === 'connected') || hostDs.get(0);
    if (hostRecord) {
      const hostData = hostRecord.toData();
      searchDs.current?.set('host', hostData);
      mainStore.setSelectedHost(hostData);
    }
  }, []);

  useEffect(() => {
    loadEnvData();
    loadHostData();
  }, []);

  const value = {
    ...props,
    prefixCls,
    intlPrefix,
    formatMessage,
    tabKeys,
    mainStore,
    detailDs,
    appServiceId,
    appServiceType,
    envDs,
    searchDs,
    deleteModalStore,
    mainTabKeys,
    hostTabKeys,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
