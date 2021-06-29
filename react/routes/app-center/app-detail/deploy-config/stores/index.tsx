import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { useAppCenterStore } from '@/routes/app-center/stores';
import { DataSet as DataSetProps } from '@/interface';
import TableDataSet from './TableDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tableDs: DataSetProps,
}

const Store = createContext({} as ContextProps);

export function useDeployConfigStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
  } = props;

  const {
    prefixCls,
    intlPrefix,
    formatMessage,
  } = useAppCenterStore();

  const tableDs = useMemo(() => new DataSet(TableDataSet({ formatMessage })), []);

  const value = {
    ...props,
    prefixCls,
    intlPrefix,
    formatMessage,
    tableDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
