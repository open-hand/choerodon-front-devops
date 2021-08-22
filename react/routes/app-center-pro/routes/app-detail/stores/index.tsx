import React, {
  createContext, useContext, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import useDataSet from '@/hooks/useDataSet';
import { DataSet } from '@/interface';
import AppDataSet from './AppDataSet';
import { getAppCategories } from '@/routes/app-center-pro/utils';

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
  appCatergory:{
    name:string,
    code:string,
  }
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
        appId, appSource, deployType, status, deployTypeId, rdupmType,
      },
    },
  } = props;

  console.log(appId, appSource, deployType, status, deployTypeId, rdupmType);

  const {
    prefixCls,
    mainTabKeys: typeTabKeys,
    intlPrefix,
  } = useAppCenterProStore();

  const appDs = useMemo(() => new DataSet(AppDataSet({ appId })), [appId]);

  const appCatergory = getAppCategories(rdupmType, deployType);

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
    appCatergory,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
