/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import HostConfigApi from '../apis';

interface ContextProps {
  prefixCls: string,
  intl: { formatMessage(arg0: object, arg1?: object): string },
  appIngressDataset: DataSet,
  projectId: number,
}

const Store = createContext({} as ContextProps);

export function useAppIngressTableStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props:any) => {
    const {
      AppState: { currentMenuType: { projectId } }, children, appIngressDataset, intl,
    } = props;

    useEffect(() => {
      if (!appIngressDataset?.transport?.destroy) {
        appIngressDataset.transport.destroy = ({ data: [data] }:any) => ({
          url: HostConfigApi.dockerDelete(projectId, data.hostId, data.id),
          method: 'delete',
        });
      }
    }, [appIngressDataset.transport, projectId]);

    const value = {
      ...props,
      prefixCls: 'c7ncd-appIngress-table',
      appIngressDataset,
      intl,
      projectId,
    };

    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
