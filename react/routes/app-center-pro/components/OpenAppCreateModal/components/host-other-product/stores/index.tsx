import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import hostOtherProductDataSet from './hostOtherProductDataSet';
// import {
//   ConfigurationCenterDataSet,
//   ConfigCompareOptsDS,
// } from '@/components/configuration-center/stores/ConfigurationCenterDataSet';

interface ContextType {
  children: any;
  cRef: any;
  HostOtherProductDataSet: any;
  style: object;
  AppState: any;
//   configurationCenterDataSet: DataSet;
//   configCompareOptsDS: DataSet;
}

const Store = createContext({} as ContextType);

export function useHostOtherProductStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: any) => {
  const {
    children,
    // AppState: {
    //   menuType: { projectId, organizationId },
    // },
  } = props;

  const HostOtherProductDataSet = useMemo(() => new DataSet(hostOtherProductDataSet()), []);

  //   const configCompareOptsDS = useMemo(
  //     () => new DataSet(ConfigCompareOptsDS({ projectId, organizationId })),
  //     [],
  //   );

  //   const configurationCenterDataSet = useMemo(
  //     () => new DataSet(
  //       // @ts-ignore
  //       ConfigurationCenterDataSet({ projectId, organizationId, optsDS: configCompareOptsDS }),
  //     ),
  //     [],
  //   );

  const value = {
    ...props,
    HostOtherProductDataSet,
    // configurationCenterDataSet,
    // configCompareOptsDS,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
});
