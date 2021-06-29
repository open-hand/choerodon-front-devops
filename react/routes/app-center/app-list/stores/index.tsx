import React, {
  createContext, useMemo, useContext, useEffect,
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

  const defaultTabKey = useMemo(() => tabKeys.ALL_TAB, []);

  const mainStore = useStore({ defaultTabKey });
  const deployStore = useDeployStore();

  const envDs = useMemo(() => new DataSet(EnvOptionsDataSet({ projectId })), [projectId]);
  const searchDs = useMemo(() => new DataSet(SearchDataSet({ envDs })), []);
  const listDs = useMemo(() => new DataSet(ListDataSet({
    projectId,
    defaultTabKey,
    searchDs,
  })), [projectId]);

  useEffect(() => {
    listDs.loadData([{
      id: '160033760358584320',
      name: 'Go服务',
      type: 'project',
      code: 'go-terminated',
      version: '1.0.0',
      gitlab: 'http://.../go-terminated.git',
    }, {
      id: 'asfdsaaa',
      name: '共享应用服务',
      type: 'share',
      code: 'share-service',
      version: '1.0.0',
      sourceProject: 'C7N敏捷',
    }, {
      id: '195867298169098240',
      name: 'demo1',
      type: 'market',
      source: '平台预置',
      version: '1.0.0',
    }]);
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
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
