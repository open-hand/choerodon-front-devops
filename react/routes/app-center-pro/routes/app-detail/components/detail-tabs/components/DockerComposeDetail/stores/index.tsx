import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import dockerComposeDetailDataSet from './docerkComposeTableDataSet';

interface ContextType {
  DockerComposeDetailDataSet: any
  id: any,
}

const Store = createContext({} as ContextType);

export function useStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
    id,
  } = props;

  const DockerComposeDetailDataSet = useMemo(() => new DataSet(dockerComposeDetailDataSet(id)), []);

  const value = {
    ...props,
    DockerComposeDetailDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
