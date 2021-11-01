/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ConfigurationDetailDataSet,
} from '@/components/configuration-center/stores/ConfigurationCenterDataSet';

interface ContextProps {
  prefixCls: string,
  intl: { formatMessage(arg0: object, arg1?: object): string },
  appIngressDataset: DataSet,
  configurationDetailDataSet?:DataSet,
  projectId: number,
}

const Store = createContext({} as ContextProps);

export function useAppIngressTableStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props:any) => {
    const {
      AppState: { currentMenuType: { projectId } },
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
    const configurationDetailDataSet = useMemo(
      () => new DataSet(
      // @ts-ignore
        ConfigurationDetailDataSet({ projectId }),
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
      configurationDetailDataSet,
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
