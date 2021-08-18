import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
}

const Store = createContext({} as ContextProps);

export function useAppDetailsStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = props;

  const {
    prefixCls,
    mainTabKeys: typeTabKeys,
    intlPrefix,
  } = useAppCenterProStore();

  const value = {
    ...props,
    subfixCls: `${prefixCls}-appDetail`,
    formatMessage,
    typeTabKeys,
    intlPrefix,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
