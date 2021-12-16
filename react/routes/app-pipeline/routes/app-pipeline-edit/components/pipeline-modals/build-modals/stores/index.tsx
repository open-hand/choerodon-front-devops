import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import buildDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/buildDataSet';
import stepDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/stepDataSet';
import advancedDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/advanced-setting/stores/advancedDataSet';

interface buildModalProps {
  modal: any,
  BuildDataSet: any
  StepDataSet: any,
}

const Store = createContext({} as buildModalProps);

export function useBuildModalStore() {
  return useContext(Store);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
  } = props;

  const BuildDataSet = useMemo(() => new DataSet(buildDataSet()), []);
  const StepDataSet = useMemo(() => new DataSet(stepDataSet()), []);

  const value = {
    ...props,
    BuildDataSet,
    StepDataSet,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
