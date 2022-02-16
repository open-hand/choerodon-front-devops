import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import hostDockerConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-docker-config/stores/hostDockerConfigDataSet';

interface ContextType {
  children: any;
  cRef: any;
  HostDockerConfigDataSet: any,
}

const Store = createContext({} as ContextType);

export function useDockerConfigStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const HostDockerConfigDataSet = useMemo(() => new DataSet(hostDockerConfigDataSet()), []);

  const value = {
    ...props,
    HostDockerConfigDataSet,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
};
