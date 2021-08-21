/* eslint-disable max-len */
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
  RESOURCE,
  RUNNING_DETAILS,
} from './CONST';
import useStore, { StoreProps } from './useStore';
import runningDetailsStore, { StoreProps as DetailsStoreProps } from './RunningDetailsStore';
import AppDetailsDataSet from './AppDetailsDataSet';
import AppEventsDataSet from './AppEventsDataSet';
import PodsDetailsDataSet from './PodsDetailsDataSet';
import ResourceConfigDs from './ResourceConfigDataSet';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tabKeys: {name: string, key: string}[],
  appDetailTabStore: StoreProps,
  refresh: (callback?:CallableFunction) => void,
  appDs:DataSet,
  appDetailsDs: DataSet,
  appEventsDs: DataSet,
  podDetailsDs: DataSet,
  runDetailsStore: DetailsStoreProps,
  resourceConfigDs: DataSet,
  // appEventQuery: (...args:any[]) => any,
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
    appDs,
    appId: appCenterId,
    deployTypeId: hostOrEnvId,
    deployType,
  } = useAppDetailsStore();

  const intlPrefix = 'c7ncd.deployment';

  const tabKeys = useMemo(() => [...deployGroupKeys, ...hostKeys], []);

  const [appDetailsDs, appDetailsQuery] = useDataSet(AppDetailsDataSet(), []);

  // 应用事件
  const appEventsDs = useMemo(() => new DataSet(AppEventsDataSet({ appCenterId, projectId })), [appCenterId, projectId]);

  // pod详情
  const podDetailsDs = useMemo(() => new DataSet(PodsDetailsDataSet({
    formatMessage,
    intlPrefix,
    appCenterId,
    projectId,
    envId: hostOrEnvId,
  })), [appCenterId, projectId]);

  // 资源配置
  const resourceConfigDs = useMemo(() => new DataSet(ResourceConfigDs({ projectId, appCenterId })), [appCenterId, projectId]);

  // 运行详情
  const runDetailsStore = runningDetailsStore({ projectId, appCenterId, envId: hostOrEnvId });

  const appDetailTabStore = useStore();

  const refresh = useCallback((callback?:CallableFunction) => {
    appDetailsQuery();
    switch (appDetailTabStore.currentTabKey) {
      case APP_EVENT:
        appEventsDs.query();
        break;
      case POD_DETAILS:
        podDetailsDs.query();
        break;
      case RUNNING_DETAILS:
        runDetailsStore.loadResource();
        break;
      case RESOURCE:
        resourceConfigDs.query();
        break;
      default:
        break;
    }
    typeof callback === 'function' && callback();
  }, [appDetailTabStore.currentTabKey, appDetailsQuery, appEventsDs, podDetailsDs, runDetailsStore]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    ...props,
    formatMessage,
    intlPrefix,
    subfixCls,
    tabKeys,
    appDetailTabStore,
    appEventsDs,
    appDetailsDs,
    runDetailsStore,
    resourceConfigDs,
    // appEventQuery,
    appDetailsQuery,
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
