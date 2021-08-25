import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import networkConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/network-config/stores/networkConfigDataSet';
import portsDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/network-config/stores/portsDataSet';

interface ContextType {
  children: any,
  cRef: any,
  NetworkConfigDataSet: any,
  envId: string,
  PortsDataSet: any,
}

const Store = createContext({} as ContextType);

export function useNetworkConfig() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
    envId,
  } = props;

  const PortsDataSet = useMemo(() => new DataSet(portsDataSet()), []);
  const NetworkConfigDataSet = useMemo(
    () => new DataSet(networkConfigDataSet(envId, PortsDataSet)), [envId],
  );

  const value = {
    ...props,
    NetworkConfigDataSet,
    PortsDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
