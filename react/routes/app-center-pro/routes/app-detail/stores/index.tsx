import React, {
  createContext, useContext, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import useDataSet from '@/hooks/useDataSet';
import { DataSet } from '@/interface';
import AppDataSet from './AppDataSet';

interface ContextProps {
  subfixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  deployTypeId:string,
  appId:string,
  appSource:string
  deployType:string
  status:string
  appDs:DataSet
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
    match: {
      params: {
        appId, appSource, deployType, status, deployTypeId,
      },
    },
  } = props;

  console.log(appId, appSource, deployType, status, deployTypeId);

  const {
    prefixCls,
    mainTabKeys: typeTabKeys,
    intlPrefix,
  } = useAppCenterProStore();

  const appDs = useMemo(() => new DataSet(AppDataSet({ appId })), [appId]);

  const value = {
    ...props,
    subfixCls: `${prefixCls}-appDetail`,
    formatMessage,
    typeTabKeys,
    intlPrefix,
    deployTypeId,
    appId,
    appSource,
    deployType,
    status,
    appDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
