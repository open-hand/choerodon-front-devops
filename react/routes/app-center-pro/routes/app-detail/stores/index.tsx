/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import { DataSet } from '@/interface';
import AppDataSet from './AppDataSet';
import { getAppCategories, getChartSourceGroup } from '@/routes/app-center-pro/utils';
import { ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  deployTypeId:string,
  appId:string,
  appSource:string
  deployType:typeof ENV_TAB | typeof HOST_TAB
  rdupmType:string
  appDs:DataSet
  appCatergory:{
    name:string,
    code:string,
  }
  appChartSourceGroup: string
}

const Store = createContext({} as ContextProps);

export function useAppDetailsStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
    match: {
      params: {
        appId, appSource, deployType, deployTypeId, rdupmType,
      },
    },
  } = props;

  const {
    prefixCls,
    mainTabKeys: typeTabKeys,
    intlPrefix,
  } = useAppCenterProStore();

  const appDs = useMemo(() => new DataSet(AppDataSet({ appId, projectId, deployType })), [appId, deployType, projectId]);

  // 部署对象
  const appCatergory = getAppCategories(rdupmType, deployType);

  // 制品来源分组，3大组
  const appChartSourceGroup = getChartSourceGroup(appSource, deployType);

  const value = {
    ...props,
    subfixCls: `${prefixCls}-appDetail`,
    formatMessage,
    typeTabKeys,
    intlPrefix,
    deployTypeId,
    appId,
    appSource,
    deployType,
    appDs,
    appCatergory,
    appChartSourceGroup,
    rdupmType,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
