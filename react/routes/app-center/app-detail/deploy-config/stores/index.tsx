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

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tableDs: DataSetProps,
}

const Store = createContext({} as ContextProps);

export function useDeployConfigStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
  } = props;

  const {
    prefixCls,
    intlPrefix,
    formatMessage,
    appServiceId,
    mainStore,
  } = useAppCenterDetailStore();

  const tableDs = useMemo(() => new DataSet(TableDataSet({
    formatMessage,
    projectId,
    appServiceId,
  })), [projectId, appServiceId]);

  useEffect(() => {
    const { id: envId } = mainStore.getSelectedEnv || {};
    if (envId) {
      tableDs.setQueryParameter('env_id', envId);
      tableDs.query();
    }
  }, [mainStore.getSelectedEnv]);

  const value = {
    ...props,
    prefixCls,
    intlPrefix,
    formatMessage,
    tableDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
