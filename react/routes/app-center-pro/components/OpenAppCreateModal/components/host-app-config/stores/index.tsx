import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import hostAppConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/stores/hostAppConfigDataSet';

interface ContextType {
  children: any,
  cRef: any,
  HostAppConfigDataSet: any,
  refresh?: Function,
  detail?: string | object,
}

const Store = createContext({} as ContextType);

export function useHostAppConfigStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const HostAppConfigDataSet = useMemo(() => new DataSet(hostAppConfigDataSet()), []);

  const value = {
    ...props,
    HostAppConfigDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
