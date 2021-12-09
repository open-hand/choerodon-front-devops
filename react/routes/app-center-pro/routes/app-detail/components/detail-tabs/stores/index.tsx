/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { useAppDetailsStore } from '../../../stores';
import {
  APP_EVENT,
  chartKeys,
  deployGroupKeys,
  hostKeys,
  POD_DETAILS,
  RESOURCE,
  RUNNING_DETAILS,
} from './CONST';
import useStore, { StoreProps } from './useStore';
import runningDetailsStore, { StoreProps as DetailsStoreProps } from './RunningDetailsStore';
import AppEventsDataSet from './AppEventsDataSet';
import PodsDetailsDataSet from './PodsDetailsDataSet';
import ResourceConfigDs from './ResourceConfigDataSet';
import { getAppCategories } from '@/routes/app-center-pro/utils';
import {
  CHART_CATERGORY, DEPLOY_CATERGORY, HOST_CATERGORY, MIDDLWARE_CATERGORY, OTHER_CATERGORY,
} from '@/routes/app-center-pro/stores/CONST';
// import {
//   ConfigurationDetailDataSet,
// } from '@/components/configuration-center/stores/ConfigurationCenterDataSet';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tabKeys: {name: string, key: string}[],
  appDetailTabStore: StoreProps,
  refresh: (refreshDetails?:boolean, callback?:CallableFunction) => void,
  loadData: (...args:any[])=>any
  appEventsDs: DataSet,
  podDetailsDs: DataSet,
  runDetailsStore: DetailsStoreProps,
  resourceConfigDs: DataSet,
//   configurationDetailDataSet:DataSet,
  podDetialsQuery:(...args:any[]) => any;
  projectId: string,
  instanceId?:any,
}

const Store = createContext({} as ContextProps);

export function useAppDetailTabsStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId, organizationId } },
  } = props;

  const {
    subfixCls,
    appId: appCenterId,
    deployTypeId: hostOrEnvId,
    deployType,
    rdupmType,
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
      case OTHER_CATERGORY:
      case MIDDLWARE_CATERGORY:
        current = hostKeys;
        break;
      default:
        break;
    }
    return current;
  }, [appCatergory?.code]);

  // 应用事件
  const appEventsDs = useMemo(() => new DataSet(AppEventsDataSet({ appCenterId })), [appCenterId]);

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

  //   // 配置中心详情
  //   const configurationDetailDataSet = useMemo(
  //     () => new DataSet(
  //       // @ts-ignore
  //       ConfigurationDetailDataSet({ projectId }),
  //     ),
  //     [],
  //   );

  const appDetailTabStore = useStore({ defaultKey: tabKeys[0] });

  const loadData = useCallback(() => {
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
  }, [appDetailTabStore.currentTabKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = async () => {
    try {
      const res = await appDs.query();
      return res;
    } catch (error) {
      throw new Error(error);
    }
  };

  const value = {
    ...props,
    formatMessage,
    intlPrefix,
    subfixCls,
    tabKeys,
    appDetailTabStore,
    appEventsDs,
    runDetailsStore,
    resourceConfigDs,
    refresh,
    projectId,
    podDetailsDs,
    loadData,
    // configurationDetailDataSet,
    instanceId: appDs.current?.get('instanceId'),
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
