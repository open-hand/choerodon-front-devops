import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import appInfoDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-info/stores/appInfoDataSet';

interface ContextType {
  children: any,
  AppInfoDataSet: any,
  cRef: any,
  isDeploy?: boolean,
  envId?: string,
}

const Store = createContext({} as ContextType);

export function useAppInfoStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
    envId,
  } = props;

  const AppInfoDataSet = useMemo(() => new DataSet(appInfoDataSet(envId)), [envId]);

  const value = {
    ...props,
    AppInfoDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
