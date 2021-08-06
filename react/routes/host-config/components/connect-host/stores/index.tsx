import React, {
  createContext, useContext, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import useStore, { StoreProps } from './useStore';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  modal: any,
  projectId: number,
  hostId: string,
  data: string,
  mainStore: StoreProps,
  typeKeys: {
    AUTO: 'auto',
    MANUAL: 'manual',
  },
  stepKeys: {
    AUTO: 'auto',
    MANUAL: 'manual',
    ALL: 'all',
  }
}

const Store = createContext({} as ContextProps);

export function useHostConnectStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = props;

  const typeKeys = useMemo(() => ({
    AUTO: 'auto',
    MANUAL: 'manual',
  }), []);
  const stepKeys = useMemo(() => ({
    AUTO: 'auto',
    MANUAL: 'manual',
    ALL: 'all',
  }), []);

  const mainStore = useStore({ defaultStep: stepKeys.ALL, defaultType: typeKeys.AUTO });

  const value = {
    ...props,
    prefixCls: 'c7ncd-host-config-command',
    intlPrefix: 'c7ncd.host.config',
    formatMessage,
    projectId,
    mainStore,
    typeKeys,
    stepKeys,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
