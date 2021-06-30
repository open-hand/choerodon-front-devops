/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSetProps } from '@/interface';
import SecretTableDataSet from './SecretTableDataSet';
// import { useResourceStore } from '../../../../stores';
import useSecretStore, { FormStoreType } from './useSecretStore';
// import getTablePostData from '../../../../../../utils/getTablePostData';
import { useAppCenterDetailStore } from '../../../stores';

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
}

const Store = createContext({} as ContextProps);

export function useSecretsStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props:any) => {
    const { AppState: { currentMenuType: { projectId } }, children } = props;
    // const {
    //   resourceStore: { getSelectedMenu: { parentId }, setUpTarget, getUpTarget },
    //   itemTypes: { CIPHER_GROUP },
    // } = useResourceStore();

    const {
      prefixCls,
      intlPrefix,
      formatMessage,
      appServiceId,
      mainStore,
    } = useAppCenterDetailStore();

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
    };

    // useEffect(() => {
    //   const { type, id: envId } = getUpTarget;
    //   if (parentId === envId) {
    //     if (type === CIPHER_GROUP) {
    //       SecretTableDs.query();
    //       setUpTarget({});
    //     }
    //   }
    // }, [getUpTarget]);

    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
