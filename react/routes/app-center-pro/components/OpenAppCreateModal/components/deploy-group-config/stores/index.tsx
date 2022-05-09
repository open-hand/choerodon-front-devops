// @ts-nocheck
import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import deployGroupConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config/stores/deployGroupConfigDataSet';
import optionDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config/stores/optionsDataSet';

interface ContextType {
  cRef: any,
  children: any,
  DeployGroupConfigDataSet: any,
  OptionDataSet: any,
  AnnotationsDataSet: any,
  LabelsDataSet: any,
  NodeLabelsDataSet: any,
  HostAliasesDataSet: any,
  modal?: any,
  detail?: any,
  refresh?: Function,
  isPipeline?: boolean,
  customStyle: {
    [key: string]: object,
  }
  envId?: string,
}

const Store = createContext({} as ContextType);

export function useDeployGroupConfigStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
    cRef,
    isPipeline,
    envId,
    detail,
  } = props;

  const DeployGroupConfigDataSet = useMemo(
    () => new DataSet(deployGroupConfigDataSet(
      isPipeline,
      envId,
      detail,
    )), [isPipeline, envId, detail],
  );
  const OptionDataSet = useMemo(() => new DataSet(optionDataSet()), []);
  const AnnotationsDataSet = useMemo(() => new DataSet(optionDataSet(/^([A-Za-z0-9][-A-Za-z0-9_./]*)?[A-Za-z0-9]$/)), []);
  const LabelsDataSet = useMemo(() => new DataSet(optionDataSet(/^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/)), []);
  const NodeLabelsDataSet = useMemo(() => new DataSet(optionDataSet()), []);
  const HostAliasesDataSet = useMemo(() => new DataSet(optionDataSet()), []);

  const value = {
    ...props,
    DeployGroupConfigDataSet,
    OptionDataSet,
    AnnotationsDataSet,
    LabelsDataSet,
    NodeLabelsDataSet,
    HostAliasesDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
