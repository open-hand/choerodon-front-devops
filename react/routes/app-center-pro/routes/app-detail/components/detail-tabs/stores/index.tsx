/* eslint-disable max-len */
import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import useDataSet from '@/hooks/useDataSet';
import { useAppDetailsStore } from '../../../stores';
import {
  APP_EVENT,
  chartKeys,
  deployGroupKeys,
  hostKeys,
  HOST_RUNNING_DETAILS,
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
import { getAppCategories, getChartSourceGroup } from '@/routes/app-center-pro/utils';
import {
  CHART_CATERGORY, DEPLOY_CATERGORY, HOST_CATERGORY, IS_HOST, IS_MARKET, IS_SERVICE,
} from '@/routes/app-center-pro/stores/CONST';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tabKeys: {name: string, key: string}[],
  appDetailTabStore: StoreProps,
  refresh: (refreshDetails?:boolean, callback?:CallableFunction) => void,
  appEventsDs: DataSet,
  podDetailsDs: DataSet,
  runDetailsStore: DetailsStoreProps,
  resourceConfigDs: DataSet,
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
    appId: appCenterId,
    deployTypeId: hostOrEnvId,
    deployType,
    rdupmType,
    appSource,
    appDs,
  } = useAppDetailsStore();

  const intlPrefix = 'c7ncd.deployment';

  // 区分部署组还是chart包还是jar包
  const appCatergory = getAppCategories(rdupmType, deployType);

  const tabKeys = useMemo(() => {
    let current: any[] = [];
    switch (appCatergory?.code) {
      case CHART_CATERGORY:
        current = chartKeys;
        break;
      case DEPLOY_CATERGORY:
        current = deployGroupKeys;
        break;
      case HOST_CATERGORY:
        current = hostKeys;
        break;
      default:
        break;
    }
    return current;
  }, [appSource, deployType]);

  const [appDetailsDs] = useDataSet(AppDetailsDataSet(), []);

  // 应用事件
  const appEventsDs = useMemo(() => new DataSet(AppEventsDataSet({ appCenterId, projectId })), [appCenterId, projectId]);

  // pod详情
  const podDetailsDs = useMemo(() => new DataSet(PodsDetailsDataSet({
    formatMessage,
    intlPrefix,
    appCenterId,
    projectId,
    envId: hostOrEnvId,
  })), [appCenterId, projectId, hostOrEnvId]);

  // 资源配置
  const resourceConfigDs = useMemo(() => new DataSet(ResourceConfigDs({ projectId, appCenterId })), [appCenterId, projectId]);

  // 运行详情
  const runDetailsStore = runningDetailsStore({ projectId, appCenterId, envId: hostOrEnvId });

  const appDetailTabStore = useStore({ defaultKey: tabKeys[0] });

  const refresh = useCallback((refreshDetails?:boolean, callback?:CallableFunction) => {
    refreshDetails && appDs.query();
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
  }, [appDetailTabStore.currentTabKey, appEventsDs, podDetailsDs, resourceConfigDs, runDetailsStore]);

  useEffect(() => {
    refresh();
  }, []);

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
