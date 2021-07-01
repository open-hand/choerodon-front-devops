import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import FormDataSet from './FormDataSet';
import AppOptionDataSet from './AppOptionDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  formDs: DataSetProps,
  modal: any,
  envId: string,
  appServiceId: string,
  refresh(): void,
  deployConfigId: string,
  isModify: boolean,
}

const Store = createContext({} as ContextProps);

export function useDeployConfigFormStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  (props: any) => {
    const {
      intl: { formatMessage },
      AppState: { currentMenuType: { id: projectId } },
      children,
      deployConfigId,
      envId,
      appServiceId,
      appSelectDisabled = false,
      appServiceName,
    } = props;

    const isModify = useMemo(() => deployConfigId || appSelectDisabled, []);

    const appOptionDs = useMemo(() => new DataSet(AppOptionDataSet(projectId)), [projectId]);
    const formDs = useMemo(() => new DataSet(FormDataSet({
      projectId,
      deployConfigId,
      formatMessage,
      envId,
      appServiceId,
      appOptionDs,
      appSelectDisabled,
      appServiceName,
    })), [projectId]);

    useEffect(() => {
      if (!isModify) {
        appOptionDs.query();
      }
      if (deployConfigId) {
        formDs.query();
      } else {
        formDs.create();
      }
    }, [deployConfigId]);

    const value = {
      ...props,
      formDs,
      prefixCls: 'c7ncd-deploy-config-form',
      isModify,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
