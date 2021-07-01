import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import TableDataSet from './TableDataSet';
import useStore, { FormStoreType } from './useConfigMapStore';
import DeleteModal from '../../delete-modal';

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
  deleteModals: React.ReactDOM,
  openDeleteModal: Function
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
    deleteModalStore,
  } = useAppCenterDetailStore();

  const deleteModals = useMemo(() => (
    map(deleteModalStore.getDeleteArr.filter((item:any) => item.type === 'configMap'), ({
      name, display, deleteId, type, refresh, envId,
    }) => (
      <DeleteModal
        key={deleteId}
        envId={envId}
        store={deleteModalStore}
        title={`${formatMessage({ id: `${type}.delete` })}“${name}”`}
        visible={display}
        objectId={deleteId}
        objectType={type}
        refresh={refresh}
      />
    ))
  ), [deleteModalStore.getDeleteArr]);

  const { id: envId, connect } = mainStore.getSelectedEnv || {};

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
    deleteModals,
    openDeleteModal: deleteModalStore.openDeleteModal,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
