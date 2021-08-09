import React, {
  createContext, useContext, useMemo,
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
  status: StatusProps,
  recordId: string,
  handleHzeroStop(recordId: string): void,
}

export type StatusProps = 'success' | 'failed' | 'operating' | 'canceled';

const Store = createContext({} as ContextProps);

export function useHzeroDeployDetailStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    recordId,
  } = props;

  const intlPrefix = useMemo(() => 'c7ncd.deploy.hzero', []);

  const typeDs = useMemo(() => new DataSet({
    data: [{
      text: formatMessage({ id: `${intlPrefix}.type.open` }),
      value: 'open',
    }, {
      text: formatMessage({ id: `${intlPrefix}.type.business` }),
      value: 'business',
    }],
  }), []);

  const serviceDs = useMemo(() => new DataSet(ServiceDataSet({
    formatMessage,
    intlPrefix,
  })), []);
  const formDs = useMemo(() => new DataSet(FormDataSet({
    formatMessage,
    intlPrefix,
    serviceDs,
    typeDs,
    recordId,
  })), []);

  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'c7ncd-deploy-hzero',
    formatMessage,
    formDs,
    serviceDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
