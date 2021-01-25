import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import ListDataSet from '@/routes/host-config/stores/ListDataSet';
import SearchDataSet from '@/routes/host-config/stores/SearchDataSet';
import { DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import some from 'lodash/some';
import useStore from './useStore';

// @ts-ignore
const HAS_BASE_PRO = C7NHasModule('@choerodon/base-business');

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
  mainStore:any,
  showTestTab: boolean,
  statusDs:DataSet,
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

  const hostTabKeys = useMemo(() => [
    {
      key: 'distribute_test',
      text: '测试主机',
    },
    {
      key: 'deploy',
      text: '部署主机',
    },
  ], []);

  const statusDs = useMemo(() => new DataSet({
    data: [],
    selection: 'single' as DataSetSelection,
  }), []);

  const showTestTab = useMemo(() => HAS_BASE_PRO && some(categories, ['code', 'N_TEST']), [categories, HAS_BASE_PRO]);

  const mainStore = useStore();

  const listDs = useMemo(() => new DataSet(ListDataSet({ projectId, showTestTab })), [projectId]);
  const searchDs = useMemo(() => new DataSet(SearchDataSet({ projectId })), [projectId]);

  const refresh = useCallback(async (callback?:CallableFunction) => {
    await listDs.query();
    typeof callback === 'function' && callback();
  }, [listDs]);

  useEffect(() => {
    if (!showTestTab) {
      mainStore.setCurrentTabKey('deploy');
    }
  }, []);

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
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
