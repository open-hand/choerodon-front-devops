import React, {
  createContext, ReactNode, useCallback, useContext, useMemo,
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
  tabKey: {
    DEPLOY_TAB: 'deploy',
    TEST_TAB: 'distribute_test',
  },
  appInstanceTableDs: DataSetProps,
  usageDs: DataSetProps,
  hasExtraTab: boolean,
  tab: ReactNode,
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
    data: [
      {
        text: formatMessage({ id: 'connect' }),
        value: 'connected',
      },
      {
        text: formatMessage({ id: 'disconnect' }),
        value: 'disconnect',
      },
    ],
    selection: 'single' as DataSetSelection,
  }), []);

  const showTestTab = useMemo(() => some(categories, ['code', 'N_TEST']), [categories]);
  const mainStore = useStore();

  const searchDs = useMemo(() => new DataSet(SearchDataSet({ statusDs })), []);
  const listDs = useMemo(() => new DataSet(ListDataSet({
    projectId,
    searchDs,
    mainStore,
  })), [projectId]);

  const usageDs = useMemo(() => new DataSet(UsageDataSet({ projectId })), [projectId]);
  const appInstanceTableDs = useMemo(() => new DataSet(AppInstanceTableDataSet({
    projectId,
    formatMessage,
    intlPrefix,
  })), [projectId]);

  const refresh = useCallback(async (callback?:CallableFunction) => {
    await listDs.query();
    typeof callback === 'function' && callback();
    if (mainStore.getSelectedHost?.id
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
