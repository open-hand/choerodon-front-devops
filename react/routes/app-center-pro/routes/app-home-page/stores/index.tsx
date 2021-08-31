import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import EnvOptionsDataSet from '@/routes/app-center-pro/stores/EnvOptionsDataSet';
import HostOptionsDataSet from '@/routes/app-center-pro/stores/HostOptionsDataSet';
import { DataSet as DataSetProps } from '@/interface';
import useStore, { StoreProps } from './useStore';
import SearchDataSet from './SearchDataSet';
import ListDataSet from './ListDataSet';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  searchDs: DataSetProps,
  listDs: DataSetProps,
  mainStore: StoreProps,
  ALL_ENV_KEY: string,
  projectId:string,
  typeTabKeys: {
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  }
  refresh:(...args:any[])=>any
}

const Store = createContext({} as ContextProps);

export function useAppHomePageStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = props;

  const {
    prefixCls,
    mainTabKeys: typeTabKeys,
    intlPrefix,
  } = useAppCenterProStore();

  const defaultTypeTabKey = typeTabKeys.ENV_TAB;
  const ALL_ENV_KEY = '0';
  const mainStore = useStore({ defaultTypeTabKey });

  const envDs = useMemo(() => new DataSet(EnvOptionsDataSet()), []);
  const hostDs = useMemo(() => new DataSet(HostOptionsDataSet()), []);
  const searchDs = useMemo(() => new DataSet(SearchDataSet({ envDs, hostDs, ALL_ENV_KEY })), []);

  const listDs = useMemo(() => new DataSet(ListDataSet({
    searchDs,
  })), []);

  const loadEnvData = useCallback(async () => {
    await envDs.query();
    envDs.appendData([{
      name: '全部环境',
      id: ALL_ENV_KEY,
      permission: true,
      connect: true,
    }]);
    searchDs.current?.init('env_id', ALL_ENV_KEY);
  }, []);

  const loadHostData = useCallback(async () => {
    await hostDs.query();
    hostDs.appendData([{
      name: '全部主机',
      id: ALL_ENV_KEY,
    }]);
    searchDs.current?.init('host_id', ALL_ENV_KEY);
  }, []);

  useEffect(() => {
    listDs.setQueryParameter('typeKey', defaultTypeTabKey);
    loadEnvData();
    loadHostData();
  }, []);

  const refresh = () => {
    listDs.query();
  };

  const value = {
    ...props,
    subfixCls: `${prefixCls}-homepage`,
    formatMessage,
    listDs,
    mainStore,
    typeTabKeys,
    searchDs,
    ALL_ENV_KEY,
    intlPrefix,
    projectId,
    refresh,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));