import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import networkConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/network-config/stores/networkConfigDataSet';

interface ContextType {
  children: any,
  cRef: any,
  NetworkConfigDataSet: any,
  envId: string,
}

const Store = createContext({} as ContextType);

export function useNetworkConfig() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const NetworkConfigDataSet = useMemo(() => new DataSet(networkConfigDataSet()), []);

  const value = {
    ...props,
    NetworkConfigDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
