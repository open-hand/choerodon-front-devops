import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
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
  refresh(data?: { valueId: string, value: string }): void,
  deployConfigId: string,
  isModify: boolean,
  valueLoading:boolean
}

const Store = createContext({} as ContextProps);

export function useDeployConfigFormStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props: any) => {
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

    const [valueLoading, setValueLoading] = useState(true);

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
      setValueLoading,
    })),
    [
      appOptionDs,
      appSelectDisabled,
      appServiceId,
      appServiceName,
      deployConfigId,
      envId,
    ]);

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
      valueLoading,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
