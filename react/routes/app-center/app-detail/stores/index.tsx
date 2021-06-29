import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import useStore, { StoreProps } from '@/routes/app-center/app-detail/stores/useStore';
import DetailDataSet from '@/routes/app-center/app-detail/stores/DetailDataSet';
import EnvOptionsDataSet from '@/routes/app-center/stores/EnvOptionsDataSet';
import { useAppCenterStore } from '@/routes/app-center/stores';
import { DataSet as DataSetProps } from '@/interface';
import SearchDataSet from '@/routes/app-center/app-detail/stores/SearchDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  tabKeys: {
    INSTANCE_TAB: 'instance',
    DEPLOYCONFIG_TAB: 'deployConfig',
    SERVICEANDINGRESS_TAB: 'serviceAndIngress',
    CONFIGMAP_TAB: 'configMap',
    SECRET_TAB: 'secret',
  }
  mainStore: StoreProps,
  detailDs: DataSetProps,
  searchDs: DataSetProps,
  appServiceType: 'project' | 'share' | 'market',
}

const Store = createContext({} as ContextProps);

export function useAppCenterDetailStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
    match: { params: { id: appServiceId, type: appServiceType } },
  } = props;

  const {
    prefixCls,
    intlPrefix,
    formatMessage,
  } = useAppCenterStore();

  const tabKeys = useMemo(() => ({
    INSTANCE_TAB: 'instance',
    DEPLOYCONFIG_TAB: 'deployConfig',
    SERVICEANDINGRESS_TAB: 'serviceAndIngress',
    CONFIGMAP_TAB: 'configMap',
    SECRET_TAB: 'secret',
  }), []);

  const defaultTabKey = useMemo(() => tabKeys.INSTANCE_TAB, []);

  const mainStore = useStore({ defaultTabKey });

  const detailDs = useMemo(() => new DataSet(DetailDataSet({
    projectId,
    appServiceId,
    appServiceType,
  })), [projectId]);
  const envDs = useMemo(() => new DataSet(EnvOptionsDataSet({ projectId })), [projectId]);
  const searchDs = useMemo(() => new DataSet(SearchDataSet({ envDs })), []);

  useEffect(() => {
    detailDs.loadData([{
      id: 'asfds',
      name: 'DevOps服务',
      type: 'project',
      code: 'devops-service',
      version: '1.0.0',
      gitlab: 'https://...service-demo.git',
    }]);
  }, []);

  const value = {
    ...props,
    prefixCls,
    intlPrefix,
    formatMessage,
    tabKeys,
    mainStore,
    detailDs,
    appServiceType,
    envDs,
    searchDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
