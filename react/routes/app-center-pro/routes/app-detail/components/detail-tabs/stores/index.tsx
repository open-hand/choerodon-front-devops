import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import useDataSet from '@/hooks/useDataSet';
import { usePersistFn } from 'ahooks';
import { observer } from 'mobx-react-lite';
import { useAppDetailsStore } from '../../../stores';
import {
  APP_EVENT,
  deployGroupKeys,
  hostKeys,
  POD_DETAILS,
} from './CONST';
import useStore, { StoreProps } from './useStore';
import AppEventsDataSet from './AppDetailsDataSet';
import AppDetailsDataSet from './AppEventsDataSet';
import PodsDetailsDataSet from './PodsDetailsDataSet';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tabKeys: {name: string, key: string}[],
  appDetailTabStore: StoreProps,
  refresh: () => void,
  appDetailsDs: DataSet,
  appEventsDs: DataSet,
  podDetailsDs: DataSet,
  appEventQuery: (...args:any[]) => any,
  appDetailsQuery: (...args:any[]) => any;
  podDetialsQuery:(...args:any[]) => any;
  projectId: string,
}

const Store = createContext({} as ContextProps);

export function useAppDetailTabsStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = props;

  const {
    subfixCls,
  } = useAppDetailsStore();

  const intlPrefix = 'c7ncd.deployment';

  const tabKeys = useMemo(() => [...deployGroupKeys, ...hostKeys], []);

  const [appEventsDs, appEventQuery] = useDataSet(AppEventsDataSet(), []);

  const [appDetailsDs, appDetailsQuery] = useDataSet(AppDetailsDataSet(), []);

  const [podDetailsDs, podDetialsQuery] = useDataSet(PodsDetailsDataSet({
    formatMessage,
    intlPrefix,
  }), []);

  const appDetailTabStore = useStore();

  const refresh = usePersistFn(() => {
    switch (appDetailTabStore.currentTabKey) {
      case APP_EVENT:
        appEventQuery();
        appDetailsQuery();
        break;
      case POD_DETAILS:
        podDetialsQuery();
        break;
      default:
        break;
    }
  });

  useEffect(() => {
    refresh();
  }, [appDetailTabStore.currentTabKey]);

  const value = {
    ...props,
    formatMessage,
    intlPrefix,
    subfixCls,
    tabKeys,
    appDetailTabStore,
    appEventsDs,
    appDetailsDs,
    appEventQuery,
    appDetailsQuery,
    podDetialsQuery,
    refresh,
    projectId,
    podDetailsDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
