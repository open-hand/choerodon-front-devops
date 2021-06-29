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
      id: 'asfds',
      name: 'DevOps服务',
      type: 'project',
      code: 'devops-service',
      version: '1.0.0',
      gitlab: 'https://...service-demo.git',
    }, {
      id: 'asfdsaaa',
      name: '共享应用服务',
      type: 'share',
      code: 'share-service',
      version: '1.0.0',
      sourceProject: 'C7N敏捷',
    }, {
      id: 'asfdssfas',
      name: 'Hzero服务',
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
