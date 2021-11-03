/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import hostAppConfigDataSet from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/stores/hostAppConfigDataSet';
// import {
//   ConfigurationCenterDataSet,
//   ConfigCompareOptsDS,
// } from '@/components/configuration-center/stores/ConfigurationCenterDataSet';

interface ContextType {
  modal?: any;
  children: any;
  cRef: any;
  HostAppConfigDataSet: any;
  refresh?: Function;
  detail?:
    | string
    | {
        value: string;
        prodJarInfoVO: object;
        marketDeployObjectInfoVO: {
          mktAppVersionId: string;
          mktDeployObjectId: string;
        };
      };
  AppState: any;
}

const Store = createContext({} as ContextType);

export function useHostAppConfigStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: any) => {
  const {
    children,
    modal,
    detail,
    AppState: {
      menuType: { projectId, organizationId },
    },
  } = props;

  // eslint-disable-next-line max-len
  const HostAppConfigDataSet = useMemo(() => new DataSet(hostAppConfigDataSet(modal, detail)), [detail]);

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
    HostAppConfigDataSet,
    // configCompareOptsDS,
    // configurationCenterDataSet,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
});
