import React, {
  createContext, useContext, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import SelectDataSet from './SelectDataSet';
import FormDataSet from './FormDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  modal: any,
  projectId: number,
  hostId: string,
  formDs: DataSetProps,
  selectDs: DataSetProps,
  refresh(): void,
}

const Store = createContext({} as ContextProps);

export function useHostPermissionStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
    hostId,
  } = props;

  const selectDs = useMemo(() => new DataSet(SelectDataSet({
    projectId, hostId, formatMessage,
  })), [hostId]);
  const formDs = useMemo(() => new DataSet(FormDataSet({
    projectId, hostId, formatMessage, selectDs,
  })), [hostId]);

  const value = {
    ...props,
    prefixCls: 'c7ncd-host-config-permission',
    intlPrefix: 'c7ncd.host.config',
    formatMessage,
    projectId,
    selectDs,
    formDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
