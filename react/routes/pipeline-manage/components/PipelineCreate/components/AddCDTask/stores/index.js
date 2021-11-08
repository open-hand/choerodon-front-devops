/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import deployChartDataSet, { deployConfigDataSet } from './deployChartDataSet';
import addCDTaskDataSet from './addCDTaskDataSet';
import deployGroupDataSet from '@/routes/pipeline-manage/components/PipelineCreate/components/AddCDTask/stores/deployGroupDataSet';
import { hostJarDataSet, hotJarOptionsDataSet } from './hostJarDataSet';
import useStore from './useStore';
import { fieldMap } from './addCDTaskDataSetMap';
import {
  ConfigurationCenterDataSet,
  ConfigCompareOptsDS,
  DeployConfigDataSet,
} from '@/components/configuration-center/stores/ConfigurationCenterDataSet';

const Store = createContext();

export function useAddCDTaskStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(
  inject('AppState')((props) => {
    const {
      children,
      random,
      PipelineCreateFormDataSet,
      //   AppServiceOptionsDs,
      //   PipelineCreateFormDataSet,
      AppState: {
        menuType: { projectId, organizationId },
      },
      appServiceCode,
      trueAppServiceId,
    } = props;

    const ADDCDTaskUseStore = useStore();
    const ADDCDTaskDataSet = useMemo(
      () => new DataSet(
        addCDTaskDataSet(
          projectId,
          PipelineCreateFormDataSet,
          organizationId,
          ADDCDTaskUseStore,
          appServiceCode,
          random,
          deployConfigDataSet,
          trueAppServiceId,
        ),
      ),
      [ADDCDTaskUseStore, random],
    );
    const DeployChartDataSet = useMemo(() => new DataSet(deployChartDataSet(ADDCDTaskDataSet)), []);
    const DeployGroupDataSet = useMemo(() => new DataSet(deployGroupDataSet(ADDCDTaskDataSet)), [
      ADDCDTaskDataSet?.current?.get('envId'),
    ]);
    const HostJarDataSet = useMemo(() => new DataSet(hostJarDataSet(ADDCDTaskDataSet)), []);
    const configCompareOptsDS = useMemo(
      () => new DataSet(ConfigCompareOptsDS({ projectId, organizationId })),
      [],
    );

    // 配置中心详情
    const configurationCenterDataSet = useMemo(
      () => new DataSet(
        // @ts-ignore
        ConfigurationCenterDataSet({ projectId, organizationId, optsDS: configCompareOptsDS }),
      ),
      [],
    );

    // 更新应用
    const deployConfigUpDateDataSet = useMemo(
      () => new DataSet(
        // @ts-ignore
        DeployConfigDataSet({ projectId, organizationId, optsDS: configCompareOptsDS }),
      ),
      [],
    );

    const HotJarOptionsDataSet = useMemo(() => new DataSet(hotJarOptionsDataSet()), []);

    const value = {
      ...props,
      ADDCDTaskUseStore,
      ADDCDTaskDataSet,
      DeployChartDataSet,
      DeployGroupDataSet,
      HostJarDataSet,
      configurationCenterDataSet,
      configCompareOptsDS,
      deployConfigUpDateDataSet,
      HotJarOptionsDataSet,
    };

    return <Store.Provider value={value}>{children}</Store.Provider>;
  }),
);
