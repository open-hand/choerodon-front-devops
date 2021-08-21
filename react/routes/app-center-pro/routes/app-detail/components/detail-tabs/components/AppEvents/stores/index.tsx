import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from '@/interface';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
}

const Store = createContext({} as ContextProps);

export function useAppEventStore() {
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
    formatMessage,
    intlPrefix: 'c7ncd.deployment',
    prefixCls: 'c7ncd-app-events',
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
