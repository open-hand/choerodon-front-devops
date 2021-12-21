import React, { createContext, useContext, useMemo } from 'react';
import { cicdPipelineApi } from '@choerodon/master';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import pipelineAdvancedConfigDataSet from './pipelineAdvancedConfigDataSet';

interface pipelineAdvancedProps {
  PipelineAdvancedConfigDataSet: any
}

const Store = createContext({} as pipelineAdvancedProps);

export function usePipelineAdvancedStore() {
  return useContext(Store);
}

export function initCustomFunc() {
  return cicdPipelineApi.getTemplate(0, undefined);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
  } = props;

  const PipelineAdvancedConfigDataSet = useMemo(
    () => new DataSet(pipelineAdvancedConfigDataSet()), [],
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
