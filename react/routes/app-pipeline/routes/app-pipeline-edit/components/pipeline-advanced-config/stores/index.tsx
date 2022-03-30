import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { cicdPipelineApi } from '@choerodon/master';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import pipelineAdvancedConfigDataSet, { transformLoadData } from './pipelineAdvancedConfigDataSet';
import certDataSet from './certDataSet';
import { useAppPipelineEditStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores';
import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';

interface pipelineAdvancedProps {
  PipelineAdvancedConfigDataSet: any
  // 层级
  level: string,
  CertDataSet: any,
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
    () => new DataSet(pipelineAdvancedConfigDataSet(data, setTabsDataState)), [data],
  );

  const CertDataSet = useMemo(() => new DataSet(certDataSet(data, setTabsDataState)), []);

  const value = {
    ...props,
    PipelineAdvancedConfigDataSet,
    CertDataSet,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
