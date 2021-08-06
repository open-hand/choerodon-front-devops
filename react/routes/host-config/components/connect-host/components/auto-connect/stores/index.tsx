import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { DataSetSelection } from '@/interface';
import { useHostConnectStore } from '@/routes/host-config/components/connect-host/stores';
import FormDataSet from './FormDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  formDs: DataSet,
  modal: any,
  refresh(tabKey?: string): void,
  hostId: string,
}

const Store = createContext({} as ContextProps);

export function useAutoConnectStore() {
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
    intlPrefix,
    hostId,
  } = useHostConnectStore();

  const accountDs = useMemo(() => new DataSet({
    data: [
      {
        text: formatMessage({ id: `${intlPrefix}.account.password` }),
        value: 'accountPassword',
      },
      {
        text: formatMessage({ id: `${intlPrefix}.account.token` }),
        value: 'publickey',
      },
    ],
    selection: 'single' as DataSetSelection,
  }), []);

  const formDs = useMemo(
    () => new DataSet(FormDataSet({
      formatMessage,
      intlPrefix,
      projectId,
      accountDs,
      hostId,
    })), [projectId],
  );

  const value = {
    ...props,
    intlPrefix,
    prefixCls: `${prefixCls}-auto`,
    formatMessage,
    projectId,
    formDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
