import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import ListDataSet from '@/routes/host-config/stores/ListDataSet';
import SearchDataSet from '@/routes/host-config/stores/SearchDataSet';
import some from 'lodash/some';
import MirrorTableDataSet from '@/routes/host-config/stores/MirrorTableDataSet';
import JarTableDataSet from '@/routes/host-config/stores/JarTableDataSet';
import { DataSet as DataSetProps, DataSetSelection } from '@/interface';
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
  mirrorTableDs: DataSetProps,
  jarTableDs: DataSetProps,
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

  const listDs = useMemo(() => new DataSet(ListDataSet({ projectId, defaultTabKey })), [projectId]);
  const searchDs = useMemo(() => new DataSet(SearchDataSet({ projectId })), [projectId]);
  const mirrorTableDs = useMemo(() => new DataSet(MirrorTableDataSet({
    projectId,
    formatMessage,
    intlPrefix,
  })), [projectId]);
  const jarTableDs = useMemo(() => new DataSet(JarTableDataSet({
    projectId,
    formatMessage,
    intlPrefix,
  })), [projectId]);

  const refresh = useCallback(async (callback?:CallableFunction) => {
    await listDs.query();
    typeof callback === 'function' && callback();
  }, [listDs]);

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
    mirrorTableDs,
    jarTableDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
