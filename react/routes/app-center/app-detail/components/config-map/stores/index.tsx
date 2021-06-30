import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import { observer } from 'mobx-react-lite';
import TableDataSet from './TableDataSet';
import useStore, { FormStoreType } from './useConfigMapStore';

interface ContextProps {
  prefixCls: string,
  subPrefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  ConfigMapTableDs: DataSetProps,
  formStore: FormStoreType,
  intl: { formatMessage(arg0: object, arg1?: object): string },
  permissions: {
    edit: string[],
    delete: string[],
  }
  envId:string,
  connect: boolean,
}

const Store = createContext({} as ContextProps);

export function useConfigMapStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props: any) => {
  const {
    children,
    intl,
    AppState: { currentMenuType: { projectId } },
  } = props;

  const {
    prefixCls,
    intlPrefix,
    formatMessage,
    appServiceId,
    mainStore,
  } = useAppCenterDetailStore();

  const { id: envId, connect } = mainStore.getSelectedEnv || {};

  console.log(mainStore.getSelectedEnv);

  const formStore = useStore();

  const tableDs = useMemo(() => new DataSet(TableDataSet({
    formatMessage,
    projectId,
    appServiceId,
    envId,
  })), [projectId, appServiceId, envId]);

  const value = {
    ...props,
    subPrefixCls: `${prefixCls}-configMap`,
    prefixCls,
    intlPrefix,
    formatMessage,
    permissions: {
      edit: ['choerodon.code.project.deploy.app-deployment.resource.ps.edit-configmap'],
      delete: ['choerodon.code.project.deploy.app-deployment.resource.ps.delete-map'],
    },
    formStore,
    ConfigMapTableDs: tableDs,
    intl,
    connect,
    envId,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
