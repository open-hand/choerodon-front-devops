import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import hostDockerConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-docker-config/stores/hostDockerConfigDataSet';

interface ContextType {
  children: any;
  cRef: any;
  HostDockerConfigDataSet: any,
  detail?: any,
  refresh?: any,
  modal?: any,
  isDetail?: any,
}

const Store = createContext({} as ContextType);

export function useDockerConfigStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
    detail,
  } = props;

  const isDetail = useMemo(() => Boolean(detail), [detail]);

  const HostDockerConfigDataSet = useMemo(() => new DataSet(
    hostDockerConfigDataSet(isDetail),
  ), [isDetail]);

  const value = {
    ...props,
    HostDockerConfigDataSet,
    isDetail,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
};
