/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import deployChartDataSet, { deployConfigDataSet } from './deployChartDataSet';
import addCDTaskDataSet from './addCDTaskDataSet';
import deployGroupDataSet
  from '@/routes/pipeline-manage/components/PipelineCreate/components/AddCDTask/stores/deployGroupDataSet';
import useStore from './useStore';
import { fieldMap } from './addCDTaskDataSetMap';

const Store = createContext();

export function useAddCDTaskStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props) => {
  const {
    children,
    random,
    // PipelineCreateFormDataSet,
    // AppServiceOptionsDs,
    PipelineCreateFormDataSet,
    AppState: {
      menuType: {
        projectId,
        organizationId,
      },
    },
    appServiceCode,
  } = props;

  const ADDCDTaskUseStore = useStore();
  const ADDCDTaskDataSet = useMemo(() => new DataSet(addCDTaskDataSet(projectId, PipelineCreateFormDataSet, organizationId, ADDCDTaskUseStore, appServiceCode, random, deployConfigDataSet)), [ADDCDTaskUseStore, random]);
  const DeployChartDataSet = useMemo(() => new DataSet(deployChartDataSet(ADDCDTaskDataSet)), [ADDCDTaskDataSet?.current?.get(fieldMap.deployWay.name)]);
  const DeployGroupDataSet = useMemo(() => new DataSet(deployGroupDataSet(ADDCDTaskDataSet)), []);

  const value = {
    ...props,
    ADDCDTaskUseStore,
    ADDCDTaskDataSet,
    DeployChartDataSet,
    DeployGroupDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
