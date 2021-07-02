import React, {
  createContext, useContext,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  modal: any,
  projectId: number,
  hostId: string,
  data: string,
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
    data,
  } = props;

  const intlPrefix = 'c7ncd.host.config';

  const value = {
    ...props,
    prefixCls: 'c7ncd-host-config-command',
    intlPrefix,
    formatMessage,
    projectId,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
