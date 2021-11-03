/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import deployChartDataSet, { deployConfigDataSet } from './deployChartDataSet';
import addCDTaskDataSet from './addCDTaskDataSet';
import deployGroupDataSet from '@/routes/pipeline-manage/components/PipelineCreate/components/AddCDTask/stores/deployGroupDataSet';
import hostJarDataSet from './hostJarDataSet';
import useStore from './useStore';
import { fieldMap } from './addCDTaskDataSetMap';
// import {
//   ConfigurationCenterDataSet,
//   ConfigCompareOptsDS,
// } from '@/components/configuration-center/stores/ConfigurationCenterDataSet';

const Store = createContext();

export function useAddCDTaskStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(
  inject('AppState')((props) => {
    const {
      children,
      random,
      // PipelineCreateFormDataSet,
      // AppServiceOptionsDs,
      PipelineCreateFormDataSet,
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
    const DeployChartDataSet = useMemo(() => new DataSet(deployChartDataSet(ADDCDTaskDataSet)), [
      ADDCDTaskDataSet?.current?.get(fieldMap.deployWay.name),
    ]);
    const DeployGroupDataSet = useMemo(() => new DataSet(deployGroupDataSet(ADDCDTaskDataSet)), [
      ADDCDTaskDataSet?.current?.get('envId'),
    ]);
    const HostJarDataSet = useMemo(() => new DataSet(hostJarDataSet(ADDCDTaskDataSet)), []);
    // const configCompareOptsDS = useMemo(
    //   () => new DataSet(ConfigCompareOptsDS({ projectId, organizationId })),
    //   [],
    // );

    // const configurationCenterDataSet = useMemo(
    //   () => new DataSet(
    //     // @ts-ignore
    //     ConfigurationCenterDataSet({ projectId, organizationId, optsDS: configCompareOptsDS }),
    //   ),
    //   [],
    // );

    const value = {
      ...props,
      ADDCDTaskUseStore,
      ADDCDTaskDataSet,
      DeployChartDataSet,
      DeployGroupDataSet,
      HostJarDataSet,
    //   configurationCenterDataSet,
    //   configCompareOptsDS,
    };

    return <Store.Provider value={value}>{children}</Store.Provider>;
  }),
);
