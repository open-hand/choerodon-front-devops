import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import appConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores/appConfigDataSet';

interface ContextType {
  children: any,
  AppConfigDataSet: any,
  cRef: any,
  modal?: any,
  refresh?: Function,
  detail?: string | {
    value: string,
    prodJarInfoVO: object,
    instanceId: string,
    appServiceVersionId: string,
    chartSource: string,
    mktAppVersionId: string,
    mktDeployObjectId: string,
    source?: string,
  },
  envId?: string,
}

const Store = createContext({} as ContextType);

export function useAppConfigStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
    envId,
    detail,
  } = props;

  console.log(detail);

  const AppConfigDataSet = useMemo(
    () => new DataSet(appConfigDataSet(envId, detail)), [envId, detail],
  );

  const value = {
    ...props,
    AppConfigDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
