import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import hostOtherProductDataSet from './hostOtherProductDataSet';

interface ContextType {
  children: any,
  cRef: any,
  HostOtherProductDataSet: any,
  style: object,
  AppState: any,
}

const Store = createContext({} as ContextType);

export function useHostOtherProductStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: any) => {
  const {
    children,
  } = props;

  const HostOtherProductDataSet = useMemo(() => new DataSet(hostOtherProductDataSet()), []);

  const value = {
    ...props,
    HostOtherProductDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
