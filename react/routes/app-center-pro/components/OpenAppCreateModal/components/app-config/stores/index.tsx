import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import appConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores/appConfigDataSet';

interface ContextType {
  children: any,
  AppConfigDataSet: any,
  cRef: any,
}

const Store = createContext({} as ContextType);

export function useAppConfigStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const AppConfigDataSet = useMemo(() => new DataSet(appConfigDataSet()), []);

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
