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
}

const Store = createContext({} as ContextType);

export function useDeployGroupConfigStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
    cRef,
  } = props;

  const DeployGroupConfigDataSet = useMemo(() => new DataSet(deployGroupConfigDataSet()), []);
  const OptionDataSet = useMemo(() => new DataSet(optionDataSet()), []);
  const AnnotationsDataSet = useMemo(() => new DataSet(optionDataSet(/^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/)), []);
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
