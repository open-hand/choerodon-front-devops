/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { useHistory, useLocation, useParams } from 'react-router';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import EnvOptionsDataSet from '@/routes/app-center-pro/stores/EnvOptionsDataSet';
import HostOptionsDataSet from '@/routes/app-center-pro/stores/HostOptionsDataSet';
import { DataSet as DataSetProps } from '@/interface';
import useStore, { StoreProps } from './useStore';
import SearchDataSet from './SearchDataSet';
import ListDataSet from './ListDataSet';
import { ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';
import useHasMarket from '@/hooks/useHasMarket';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  searchDs: DataSetProps,
  listDs: DataSetProps,
  mainStore: StoreProps,
  ALL_ENV_KEY: string,
  projectId:string,
  hasMarket: boolean
  typeTabKeys: {
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  }
  refresh:(key?: typeof ENV_TAB | typeof HOST_TAB)=>any
}

const Store = createContext({} as ContextProps);

export function useAppHomePageStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
  } = props;

  const {
    prefixCls,
    mainTabKeys: typeTabKeys,
    intlPrefix,
  } = useAppCenterProStore();

  const location = useLocation();
  const history = useHistory();
  const searchObj = new URLSearchParams(location.search);

  const defaultTypeTabKey = typeTabKeys.ENV_TAB;
  const ALL_ENV_KEY = 'All';
  const mainStore = useStore();
  const hasMarket = useHasMarket();

  const envDs = useMemo(() => new DataSet(EnvOptionsDataSet()), []);
  const hostDs = useMemo(() => new DataSet(HostOptionsDataSet()), []);

  function replaceCurrentState(field:string, value:any) {
    if ((value ?? '') !== '') {
      searchObj.set(field, value);
    } else {
      searchObj.delete(field);
    }
    history.replace({
      pathname: location.pathname,
      search: searchObj.toString(),
    });
  }

  const searchDs = useMemo(() => new DataSet(SearchDataSet({
    envDs, hostDs, ALL_ENV_KEY, formatMessage, replaceCurrentState,
  })), []);

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
  }, []);

  const loadHostData = useCallback(async () => {
    await hostDs.query();
    hostDs.appendData([{
      name: '全部主机',
      id: ALL_ENV_KEY,
    }]);
  }, []);

  const initSearchDsData = () => {
    const typeKey = searchObj.get('typeKey') || defaultTypeTabKey;
    const envId = searchObj.get('env_id') || ALL_ENV_KEY;
    const hostId = searchObj.get('host_id') || ALL_ENV_KEY;
    const operationType = searchObj.get('operation_type');
    const rdupmType = searchObj.get('rdupm_type');
    const params = searchObj.get('params');

    searchDs.current?.set('typeKey', typeKey);
    envId && searchDs.current?.set('env_id', envId);
    hostId && searchDs.current?.set('host_id', hostId);
    params && searchDs.current?.set('params', params);
    rdupmType && searchDs.current?.set('rdupm_type', rdupmType);
    operationType && searchDs.current?.set('operation_type', operationType);
  };

  useEffect(() => {
    initSearchDsData();
    loadEnvData();
    loadHostData();
  }, []);

  useEffect(() => {
    hasMarket && mainStore.loadHzeroSyncStatus();
  }, []);

  const refresh = (key?: typeof ENV_TAB | typeof HOST_TAB) => {
    if (key && [ENV_TAB, HOST_TAB].includes(key)) {
      listDs.setQueryParameter('typeKey', key);
      searchDs.current?.set('typeKey', key);
    }
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
    hasMarket,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
