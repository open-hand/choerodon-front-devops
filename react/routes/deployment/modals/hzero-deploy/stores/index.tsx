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
  const random = useMemo(() => Math.random(), []);

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
    projectId,
  })), [projectId]);
  const formDs = useMemo(() => new DataSet(FormDataSet({
    formatMessage,
    intlPrefix,
    projectId,
    serviceDs,
    random,
    typeDs,
  })), [projectId]);

  useEffect(() => {
    serviceDs.loadData([{
      name: 'hzero-1',
      id: '111',
      isRequired: true,
      instanceName: 'instance-1',
      values: 'aa',
    }, {
      name: 'hzero-2',
      id: '222',
      instanceName: 'instance-2',
      values: 'bbb',
    }, {
      name: 'hzero-3',
      id: '333',
      instanceName: 'instance-3',
      values: 'ccc',
    }]);
  }, []);

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
