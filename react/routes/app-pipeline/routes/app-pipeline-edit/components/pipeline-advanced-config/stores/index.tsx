import React, { createContext, useContext, useMemo } from 'react';
import { cicdPipelineApi } from '@choerodon/master';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import pipelineAdvancedConfigDataSet from './pipelineAdvancedConfigDataSet';
import { useAppPipelineEditStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores';
import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';

interface pipelineAdvancedProps {
  PipelineAdvancedConfigDataSet: any
}

const Store = createContext({} as pipelineAdvancedProps);

export function usePipelineAdvancedStore() {
  return useContext(Store);
}

export function initCustomFunc(id?: any) {
  return cicdPipelineApi.getTemplate(id || 0, true);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
  } = props;

  const {
    tabsData: {
      [TAB_ADVANCE_SETTINGS]: data,
    },
    setTabsDataState,
  } = useAppPipelineEditStore();

  const PipelineAdvancedConfigDataSet = useMemo(
    () => new DataSet(pipelineAdvancedConfigDataSet(data, setTabsDataState)), [],
  );

  const value = {
    ...props,
    PipelineAdvancedConfigDataSet,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
