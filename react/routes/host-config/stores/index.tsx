import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import ListDataSet from '@/routes/host-config/stores/ListDataSet';
import SearchDataSet from '@/routes/host-config/stores/SearchDataSet';
import some from 'lodash/some';
import AppInstanceTableDataSet from '@/routes/host-config/stores/AppInstanceTableDataSet';
import { DataSet as DataSetProps, DataSetSelection } from '@/interface';
import UsageDataSet from '@/routes/host-config/stores/UsageDataSet';
import useStore, { StoreProps } from './useStore';

// @ts-ignore
const HAS_BASE_PRO = C7NHasModule('@choerodon/testmanager-pro');

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  listDs: DataSet,
  searchDs: DataSet,
  hostTabKeys:{
    key:string,
    text:string,
  }[],
  refresh():void,
  mainStore:StoreProps,
  showTestTab: boolean,
  statusDs: DataSetProps,
  tabKey: {
    DEPLOY_TAB: 'deploy',
    TEST_TAB: 'distribute_test',
  },
  appInstanceTableDs: DataSetProps,
  usageDs: DataSetProps,
}

const Store = createContext({} as ContextProps);

export function useHostConfigStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId, categories } },
  } = props;
  const intlPrefix = 'c7ncd.host.config';
  const tabKey = useMemo(() => ({
    DEPLOY_TAB: 'deploy',
    TEST_TAB: 'distribute_test',
  }), []);

  const hostTabKeys = useMemo(() => [
    {
      key: tabKey.DEPLOY_TAB,
      text: '部署主机',
    },
    {
      key: tabKey.TEST_TAB,
      text: '测试主机',
    },
  ], []);

  const statusDs = useMemo(() => new DataSet({
    data: [],
    selection: 'single' as DataSetSelection,
  }), []);

  const showTestTab = useMemo(() => HAS_BASE_PRO && some(categories, ['code', 'N_TEST']), [categories, HAS_BASE_PRO]);
  const defaultTabKey = useMemo(() => tabKey.DEPLOY_TAB, []);

  const mainStore = useStore({ defaultTabKey });

  const listDs = useMemo(() => new DataSet(ListDataSet({
    projectId,
    defaultTabKey,
    tabKey,
  })), [projectId]);

  const searchDs = useMemo(() => new DataSet(SearchDataSet({ projectId })), [projectId]);
  const usageDs = useMemo(() => new DataSet(UsageDataSet({ projectId })), [projectId]);
  const appInstanceTableDs = useMemo(() => new DataSet(AppInstanceTableDataSet({
    projectId,
    formatMessage,
    intlPrefix,
  })), [projectId]);

  const loadListData = useCallback(async () => {
    await listDs.query();
    const record = listDs.get(0);
    if (defaultTabKey === tabKey.DEPLOY_TAB && record) {
      mainStore.setSelectedHost(record.toData());
    }
  }, []);

  useEffect(() => {
    loadListData();
  }, [projectId]);

  const refresh = useCallback(async (callback?:CallableFunction) => {
    listDs.setQueryParameter('forceUpdate', true);
    await listDs.query();
    typeof callback === 'function' && callback();
    if (mainStore.getCurrentTabKey === tabKey.DEPLOY_TAB
      && mainStore.getSelectedHost?.id
      && mainStore.getSelectedHost?.hostStatus === 'connected') {
      usageDs.query();
      appInstanceTableDs.query();
    }
  }, [listDs, mainStore.getSelectedHost]);

  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'c7ncd-host-config',
    formatMessage,
    listDs,
    searchDs,
    hostTabKeys,
    refresh,
    mainStore,
    projectId,
    showTestTab,
    statusDs,
    tabKey,
    appInstanceTableDs,
    usageDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
