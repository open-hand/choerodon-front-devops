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
  status: StatusProps,
}

export type StatusProps = 'success' | 'failed';

const Store = createContext({} as ContextProps);

export function useHzeroDeployDetailStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
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
    projectId,
  })), [projectId]);
  const formDs = useMemo(() => new DataSet(FormDataSet({
    formatMessage,
    intlPrefix,
    projectId,
    serviceDs,
    typeDs,
  })), [projectId]);

  useEffect(() => {
    formDs.loadData([{
      appType: 'open',
      environmentId: '11',
      environmentName: 'Staging环境',
      appVersionId: '21',
      appVersionName: '1.0.0',
      hzeroService: [{
        name: 'hzero-1',
        id: '111',
        isRequired: true,
        instanceName: 'instance-1',
        serviceVersionId: 'v-1',
        serviceVersionName: '1.0.0',
        values: 'aa',
        status: 'success',
      }, {
        name: 'hzero-2',
        id: '222',
        instanceName: 'instance-2',
        values: 'bbb',
        status: 'success',
        serviceVersionId: 'v-2',
        serviceVersionName: '2.0.0',
      }, {
        name: 'hzero-3',
        id: '333',
        instanceName: 'instance-3',
        values: 'ccc',
        status: 'failed',
        serviceVersionId: 'v-3',
        serviceVersionName: '3.0.0',
      }, {
        name: 'hzero-4',
        id: '444',
        instanceName: 'instance-4',
        values: 'ddd',
        status: 'wait',
        serviceVersionId: 'v-4',
        serviceVersionName: '4.0.0',
      }, {
        name: 'hzero-5',
        id: '555',
        instanceName: 'instance-5',
        values: 'eee',
        status: 'wait',
        serviceVersionId: 'v-5',
        serviceVersionName: '5.0.0',
      }],
    }]);
    // serviceDs.loadData();
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
