import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import { marketHzeroApi } from '@/api';
import FormDataSet from './FormDataSet';
import ServiceDataSet from './ServiceDataSet';
import useStore, { StoreProps } from './useStore';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  formDs: DataSetProps,
  serviceDs: DataSetProps,
  modal: any,
  refresh(): void,
  mainStore: StoreProps,
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
    syncStatus,
  } = props;

  const intlPrefix = useMemo(() => 'c7ncd.deploy.hzero', []);
  const random = useMemo(() => Math.random(), []);

  const mainStore = useStore();
  const typeDs = useMemo(() => new DataSet({
    data: [{
      text: formatMessage({ id: `${intlPrefix}.type.open` }),
      value: 'open',
      disabled: !syncStatus?.open,
    }, {
      text: formatMessage({ id: `${intlPrefix}.type.business` }),
      value: 'sass',
      disabled: !syncStatus?.sass,
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
    serviceDs,
    random,
    typeDs,
    mainStore,
  })), [projectId]);

  useEffect(() => {
    if (!syncStatus?.open && syncStatus?.saas) {
      formDs.current?.set('appType', 'saas');
    } else {
      formDs.current?.set('appType', 'open');
    }
  }, []);

  const value = {
    ...props,
    intlPrefix,
    prefixCls: 'c7ncd-deploy-hzero',
    formatMessage,
    projectId,
    formDs,
    serviceDs,
    mainStore,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
