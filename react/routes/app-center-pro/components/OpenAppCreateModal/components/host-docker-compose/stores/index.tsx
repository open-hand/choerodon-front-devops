import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import hostDockerCompose from './hostdockercomposeDataSet';

interface ContextProps {
  HostDockerComposeDataSet: any,
  cRef?: any,
  data?: any,
  refresh?: any,
  modal?: any,
}

const Store = createContext({} as ContextProps);

export function useHostDockerCompose() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
    data,
  } = props;

  const HostDockerComposeDataSet = useMemo(() => new DataSet(hostDockerCompose(data)), []);

  const value = {
    ...props,
    HostDockerComposeDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
