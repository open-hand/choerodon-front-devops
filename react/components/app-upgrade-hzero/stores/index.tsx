/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import useStore, { StoreProps } from './useStore';

type AppUpgradeHzeroStoreContext = {
  prefixCls:string
  intlPrefix:string
  mainStore:StoreProps
  formatMessage(arg0: object, arg1?: object): string,
  projectId:string
}

const Store = createContext({} as AppUpgradeHzeroStoreContext);

export function useAppUpgradeHzeroStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId, organizationId } },
  } = props;

  const prefixCls = 'c7ncd-app-upgrade-hzero';
  const intlPrefix = 'c7ncd.app.upgrade.hzero';

  const mainStore = useStore();

  const value = {
    ...props,
    formatMessage,
    projectId,
    mainStore,
    prefixCls,
    intlPrefix,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
