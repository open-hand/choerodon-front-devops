import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from '@/interface';
import HostConnectServices from '../services';
import FormDataSet from './FormDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  formDs: DataSet,
  modal: any,
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
    hostId,
    data,
  } = props;

  const intlPrefix = 'c7ncd.host.config';
  const formDs = useMemo(() => new DataSet(FormDataSet({
    projectId, formatMessage, intlPrefix, data,
  })), []);

  useEffect(() => {
    if (data) {
      formDs.create();
    } else {
      loadData();
    }
  }, [projectId, data]);

  const loadData = useCallback(async () => {
    const res = await HostConnectServices.getLinkShell(projectId, hostId);
    formDs.create({ command: res });
  }, [projectId, hostId]);

  const value = {
    ...props,
    prefixCls: 'c7ncd-host-config-command',
    intlPrefix,
    formatMessage,
    formDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
