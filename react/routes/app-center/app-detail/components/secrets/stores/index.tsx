/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import map from 'lodash/map';
import SecretTableDataSet from './SecretTableDataSet';
// import { useResourceStore } from '../../../../stores';
import useSecretStore, { FormStoreType } from './useSecretStore';
// import getTablePostData from '../../../../../../utils/getTablePostData';
import { useAppCenterDetailStore } from '../../../stores';
import DeleteModal from '../../delete-modal';

interface ContextProps {
  prefixCls: string,
  subPrefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  SecretTableDs: DataSet,
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

export function useSecretsStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props:any) => {
    const { AppState: { currentMenuType: { projectId } }, children } = props;

    const {
      prefixCls,
      intlPrefix,
      formatMessage,
      appServiceId,
      mainStore,
      deleteModalStore,
    } = useAppCenterDetailStore();

    const deleteModals = useMemo(() => (
      map(deleteModalStore.getDeleteArr.filter((item:any) => item.type === 'secret'), ({
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

    const SecretTableDs = useMemo(() => new DataSet(SecretTableDataSet({ formatMessage, envId, projectId })), [envId, projectId]);
    const formStore = useSecretStore();

    const value = {
      ...props,
      permissions: {
        edit: ['choerodon.code.project.deploy.app-deployment.resource.ps.edit-cipher'],
        delete: ['choerodon.code.project.deploy.app-deployment.resource.ps.delete-cipher'],
      },
      formStore,
      SecretTableDs,
      connect,
      envId,
      prefixCls,
      subPrefixCls: `${prefixCls}-secrets`,
      intlPrefix,
      formatMessage,
      deleteModals,
      openDeleteModal: deleteModalStore.openDeleteModal,
    };

    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
