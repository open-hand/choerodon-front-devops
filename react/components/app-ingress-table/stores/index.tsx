/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect, useCallback,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import HostConfigApi from '../apis';
import DsBasicObj from './ingressDsBasic';
import { hostApi } from '@/api';
import {
  ConfigurationCenterDataSet,
  ConfigCompareOptsDS,
} from '@/components/configuration-center/stores/ConfigurationCenterDataSet';

interface ContextProps {
  prefixCls: string,
  intl: { formatMessage(arg0: object, arg1?: object): string },
  appIngressDataset: DataSet,
  configurationCenterDataSet:DataSet,
  projectId: number,
}

const Store = createContext({} as ContextProps);

export function useAppIngressTableStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props:any) => {
    const {
      AppState: { currentMenuType: { projectId, organizationId } },
      children,
      appIngressDataset,
      intl,
    } = props;

    const initDs = useCallback(() => {
      const {
        fields, queryFields,
      } = DsBasicObj;
      fields.forEach((item) => {
        const {
          name,
          ...res
        } = item;
        appIngressDataset.addField(name, { ...res });
      });
      appIngressDataset.queryFields = queryFields;
      if (!appIngressDataset?.transport?.destroy) {
        appIngressDataset.transport.destroy = ({ data: [data] }:any) => (hostApi.jarDelete(data.hostId, data.id));
      }
    }, [appIngressDataset, projectId]);

    // 配置中心详情
    const configCompareOptsDS = useMemo(
      () => new DataSet(ConfigCompareOptsDS({ projectId, organizationId })),
      [],
    );

    const configurationCenterDataSet = useMemo(
      () => new DataSet(
      // @ts-ignore
        ConfigurationCenterDataSet({ projectId, organizationId, optsDS: configCompareOptsDS }),
      ),
      [],
    );

    useEffect(() => {
      initDs();
    }, [initDs]);

    const value = {
      ...props,
      prefixCls: 'c7ncd-appIngress-table',
      appIngressDataset,
      configurationCenterDataSet,
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
