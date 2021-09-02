import React, {
  createContext, useMemo, useContext, useEffect, useCallback,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetProps } from '@/interface';
import OptionsDataSet from './OptionsDataSet';
import FormDataSet from './FormDataSet';
import LinkServiceDataSet from './LinkServiceDataSet';
import EnvOptionsDataSet from './EnvOptionsDataSet';

interface ContextProps {
  prefixCls: string,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  formDs: DataSetProps,
  linkServiceDs: DataSetProps,
  serviceOptionsDs: DataSetProps,
  refresh(): void,
  modal: any,
  showEnvSelect: boolean,
}

const Store = createContext({} as ContextProps);

export function useLinkServiceStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props: any) => {
  const {
    children,
    AppState: { currentMenuType: { projectId } },
    intl: { formatMessage },
    showEnvSelect = false,
    envId,
  } = props;

  const envOptionsDs = useMemo(() => new DataSet(EnvOptionsDataSet({ projectId })), [projectId]);
  const serviceOptionsDs = useMemo(() => new DataSet(OptionsDataSet({ projectId })), [projectId]);
  const linkServiceDs = useMemo(() => new DataSet(LinkServiceDataSet({
    formatMessage,
    serviceOptionsDs,
  })), []);
  const formDs = useMemo(() => new DataSet(FormDataSet({
    projectId, formatMessage, linkServiceDs, envOptionsDs, showEnvSelect, serviceOptionsDs,
  })), [projectId]);

  useEffect(() => {
    if (envId) {
      serviceOptionsDs.setQueryParameter('env_id', envId);
      formDs.current?.init('envId', envId);
      serviceOptionsDs.query();
    }
    if (showEnvSelect) {
      envOptionsDs.query();
    }
  }, []);

  const value = {
    ...props,
    formatMessage,
    formDs,
    linkServiceDs,
    serviceOptionsDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
