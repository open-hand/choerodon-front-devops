import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
}

const Store = createContext({} as ContextProps);

export function useAppHomePageStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = props;

  const value = {
    ...props,
    prefixCls: 'c7ncd-app-center-pro-homepage',
    intlPrefix: 'c7ncd.appCenter.pro.homepage',
    formatMessage,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
