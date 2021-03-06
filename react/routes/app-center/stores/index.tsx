import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  mainTabKeys: {
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  }
}

const Store = createContext({} as ContextProps);

export function useAppCenterStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = props;

  const mainTabKeys = useMemo(() => ({
    ENV_TAB: 'env',
    HOST_TAB: 'host',
  }), []);

  const value = {
    ...props,
    prefixCls: 'c7ncd-app-center',
    intlPrefix: 'c7ncd.appCenter',
    formatMessage,
    mainTabKeys,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
