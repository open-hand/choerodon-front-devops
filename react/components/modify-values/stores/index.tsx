import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { DataSet } from '@/interface';
import ValuesDataset from './ValuesDataSet';

interface ContextProps {
  prefixCls: string,
  formatMessage(arg0: object, arg1?: object): string,
  valuesDs:DataSet,
  projectId:string,
  [fields:string]:any
}

const Store = createContext({} as ContextProps);

export function useModifyValuesStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
    appServiceVersionId,
    instanceId,
    isMarket,
  } = props;

  const valuesDs = useMemo(() => new DataSet(ValuesDataset({
    projectId,
    instanceId,
    appServiceVersionId,
    isMarket,
  })), [appServiceVersionId, instanceId, isMarket, projectId]);

  const value = {
    ...props,
    formatMessage,
    valuesDs,
    prefixCls: 'c7ncd-modify_values',
    projectId,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
