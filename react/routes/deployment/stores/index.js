import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';

import map from 'lodash/map';
import ListDataSet from './ListDataSet';
import DetailDataSet from './DetailDataSet';
import useStore from './useStore';
import usePipelineStore from './usePipelineStore';
import OptionsDataSet from './OptionsDataSet';
import useHasMarket from '@/hooks/useHasMarket';
import {
  ConfigurationCenterDataSet,
  ConfigCompareOptsDS,
} from '@/components/configuration-center/stores/ConfigurationCenterDataSet';

const Store = createContext();
const STATUS = ['success', 'failed', 'operating'];

export function useDeployStore() {
  return useContext(Store);
}

export const StoreProvider = withRouter(
  injectIntl(
    inject('AppState')((props) => {
      const {
        AppState: {
          currentMenuType: { projectId, organizationId },
        },
        intl: { formatMessage },
        children,
        location: { state },
      } = props;
      const intlPrefix = 'c7ncd.deploy';

      const hasMarket = useHasMarket();

      const deployTypeDs = useMemo(
        () => new DataSet({
          data: [
            {
              text: formatMessage({ id: `${intlPrefix}.auto` }),
              value: 'auto',
            },
            {
              text: formatMessage({ id: `${intlPrefix}.manual` }),
              value: 'manual',
            },
            {
              text: formatMessage({ id: `${intlPrefix}.batch` }),
              value: 'batch',
            },
          ],
          selection: 'single',
        }),
        [],
      );

      const deployModeDs = useMemo(
        () => new DataSet({
          data: [
            {
              text: '容器部署',
              value: 'env',
            },
            {
              text: '主机部署',
              value: 'host',
            },
          ],
        }),
        [],
      );

      const deployResultDs = useMemo(
        () => new DataSet({
          data: map(STATUS, (item) => ({
            text: formatMessage({ id: `${intlPrefix}.status.${item}` }),
            value: item,
          })),
          selection: 'single',
        }),
        [],
      );

      const deployStore = useStore();
      const pipelineStore = usePipelineStore();

      const envOptionsDs = useMemo(() => new DataSet(OptionsDataSet()), []);
      const pipelineOptionsDs = useMemo(() => new DataSet(OptionsDataSet()), []);

      const listDs = useMemo(
        () => new DataSet(
          ListDataSet(
            intlPrefix,
            formatMessage,
            projectId,
            envOptionsDs,
            deployTypeDs,
            deployResultDs,
            pipelineOptionsDs,
            deployModeDs,
          ),
        ),
        [projectId],
      );
      const detailDs = useMemo(() => new DataSet(DetailDataSet()), []);

      useEffect(() => {
        if (state && state.pipelineId) {
          listDs.queryDataSet.getField('pipelineId').set('defaultValue', state.pipelineId);
        }
        hasMarket && deployStore.loadHzeroSyncStatus();
      }, []);

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

      const value = {
        ...props,
        prefixCls: 'c7ncd-deploy',
        permissions: [
          'devops-service.devops-deploy-record.pageByOptions',
          'devops-service.app-service-instance.deploy',
          'devops-service.pipeline.batchExecute',
          'devops-service.pipeline.audit',
          'devops-service.pipeline.retry',
          'devops-service.pipeline.failed',
          'devops-service.app-service-instance.batchDeployment',
        ],
        intlPrefix,
        listDs,
        detailDs,
        deployStore,
        pipelineStore,
        envOptionsDs,
        pipelineOptionsDs,
        hasMarket,
        configurationCenterDataSet,
      };
      return <Store.Provider value={value}>{children}</Store.Provider>;
    }),
  ),
);
