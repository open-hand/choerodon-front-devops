import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import customDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/custom-modal/stores/customDataSet';

interface customModalProps {
  CustomDataSet: any,
}

const Store = createContext({} as customModalProps);

export function useCustomModalStore() {
  return useContext(Store);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
  } = props;

  const CustomDataSet = useMemo(() => new DataSet(customDataSet()), []);

  const value = {
    ...props,
    CustomDataSet,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
