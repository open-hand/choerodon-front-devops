import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import buildDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/buildDataSet';

interface buildModalProps {
  modal: any,
  BuildDataSet: any
}

const Store = createContext({} as buildModalProps);

export function useBuildModalStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const BuildDataSet = useMemo(() => new DataSet(buildDataSet()), []);

  const value = {
    ...props,
    BuildDataSet,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
