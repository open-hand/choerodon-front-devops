import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import conGroupDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';

interface ContextType {
  cRef: any,
  children: any,
  ConGroupDataSet: any,
  modal?: any,
  detail?: any,
  refresh?: Function,
}

const Store = createContext({} as ContextType);

export function useContainerConfig() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const ConGroupDataSet = useMemo(() => new DataSet(conGroupDataSet()), []);

  const value = {
    ...props,
    ConGroupDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
