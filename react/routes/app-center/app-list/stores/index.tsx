import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import ListDataSet from '@/routes/app-center/app-list/stores/ListDataSet';
import useStore, { StoreProps } from '@/routes/app-center/app-list/stores/useStore';
import SearchDataSet from '@/routes/app-center/app-list/stores/SearchDataSet';
import useDeployStore from '@/routes/deployment/stores/useStore';
import EnvOptionsDataSet from '@/routes/app-center/stores/EnvOptionsDataSet';
import HostOptionsDataSet from '@/routes/app-center/stores/HostOptionsDataSet';
import { useAppCenterStore } from '@/routes/app-center/stores';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tabKeys: {
    ALL_TAB: 'all',
    PROJECT_TAB: 'project',
    SHARE_TAB: 'share',
    MARKET_TAB: 'market',
  }
  searchDs: DataSetProps,
  listDs: DataSetProps,
  mainStore: StoreProps,
  deployStore: any,
  ALL_ENV_KEY: string,
  typeTabKeys: {
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  }
}

const Store = createContext({} as ContextProps);

export function useAppCenterListStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
  } = props;

  const {
    prefixCls,
    intlPrefix,
    formatMessage,
  } = useAppCenterStore();

  const tabKeys = useMemo(() => ({
    ALL_TAB: 'all',
    PROJECT_TAB: 'project',
    SHARE_TAB: 'share',
    MARKET_TAB: 'market',
  }), []);
  const typeTabKeys = useMemo(() => ({
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  }), []);

  const defaultTabKey = useMemo(() => tabKeys.ALL_TAB, []);
  const defaultTypeTabKey = useMemo(() => typeTabKeys.ENV_TAB, []);
  const ALL_ENV_KEY = useMemo(() => '0', []);

  const mainStore = useStore({ defaultTabKey, defaultTypeTabKey });
  const deployStore = useDeployStore();

  const envDs = useMemo(() => new DataSet(EnvOptionsDataSet({ projectId })), [projectId]);
  const hostDs = useMemo(() => new DataSet(HostOptionsDataSet({ projectId })), [projectId]);
  const searchDs = useMemo(() => new DataSet(SearchDataSet({ envDs, hostDs, ALL_ENV_KEY })), []);
  const listDs = useMemo(() => new DataSet(ListDataSet({
    projectId,
    searchDs,
  })), [projectId]);

  const loadEnvData = useCallback(async () => {
    await envDs.query();
    envDs.appendData([{
      name: '全部环境',
      id: ALL_ENV_KEY,
      permission: true,
      connect: true,
    }]);
    searchDs.current?.init('envId', ALL_ENV_KEY);
  }, []);
  const loadHostData = useCallback(async () => {
    await hostDs.query();
    hostDs.appendData([{
      name: '全部主机',
      id: ALL_ENV_KEY,
    }]);
    searchDs.current?.init('hostId', ALL_ENV_KEY);
  }, []);

  useEffect(() => {
    listDs.setQueryParameter('type', defaultTabKey);
    listDs.setQueryParameter('typeKey', defaultTypeTabKey);
    loadEnvData();
    loadHostData();
  }, []);

  const value = {
    ...props,
    prefixCls,
    intlPrefix,
    formatMessage,
    tabKeys,
    searchDs,
    listDs,
    deployStore,
    mainStore,
    ALL_ENV_KEY,
    typeTabKeys,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
