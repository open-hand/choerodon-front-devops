/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { useAppCenterDetailStore } from '../../../stores';
import AppIngressDataset from './appIngressDataset';

interface ContextProps {
  prefixCls: string,
  subfixCls: string,
  intl: { formatMessage(arg0: object, arg1?: object): string },
  appIngressDs: DataSet,
}

const Store = createContext({} as ContextProps);

export function useAppIngressStore() {
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
    } = useAppCenterDetailStore();

    const {
      id: hostId,
    } = mainStore.getSelectedHost || {};

    const appIngressDs = useMemo(() => new DataSet(AppIngressDataset({ projectId, hostId, appServiceId })), [appServiceId, hostId, projectId]);

    const value = {
      ...props,
      subfixCls: `${prefixCls}-appIngress`,
      appIngressDs,
    };

    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
