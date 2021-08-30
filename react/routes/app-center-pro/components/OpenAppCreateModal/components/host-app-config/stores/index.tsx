import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import hostAppConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/stores/hostAppConfigDataSet';

interface ContextType {
  modal?: any,
  children: any,
  cRef: any,
  HostAppConfigDataSet: any,
  refresh?: Function,
  detail?: string | {
    value: string,
    prodJarInfoVO: object,
    marketDeployObjectInfoVO: {
      mktAppVersionId: string,
      mktDeployObjectId: string,
    }
  },
  AppState: any,
}

const Store = createContext({} as ContextType);

export function useHostAppConfigStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: any) => {
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
});
