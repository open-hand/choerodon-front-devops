import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import FormDataSet from './FormDataSet';
import ServiceDataSet from './ServiceDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  formDs: DataSetProps,
  serviceDs: DataSetProps,
  modal: any,
  refresh(): void,
}

const Store = createContext({} as ContextProps);

export function useHzeroDeployStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = props;

  const intlPrefix = useMemo(() => 'c7ncd.deploy.hzero', []);

  const serviceDs = useMemo(() => new DataSet(ServiceDataSet({
    formatMessage,
    intlPrefix,
    projectId,
  })), [projectId]);
  const formDs = useMemo(() => new DataSet(FormDataSet({
    formatMessage,
    intlPrefix,
    projectId,
    serviceDs,
  })), [projectId]);

  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'c7ncd-deploy-hzero',
    formatMessage,
    projectId,
    formDs,
    serviceDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
