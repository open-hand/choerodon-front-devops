import React, {
  createContext, useMemo, useContext,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import FormDataSet from './FormDataSet';
import EnvOptionsDataSet from './EnvOptionsDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  formDs: DataSetProps,
  refresh(): void,
  modal: any,
}

const Store = createContext({} as ContextProps);

export function useDeleteRelatedStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
    intl: { formatMessage },
    appServiceId,
  } = props;

  const envOptionsDs = useMemo(() => new DataSet(EnvOptionsDataSet({
    projectId,
    appServiceId,
  })), [projectId, appServiceId]);
  const formDs = useMemo(() => new DataSet(FormDataSet({
    projectId, formatMessage, envOptionsDs, appServiceId,
  })), [projectId]);

  const value = {
    ...props,
    formatMessage,
    formDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
