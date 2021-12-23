import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import advancedDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/advanced-setting/stores/advancedDataSet';

interface advancedSettingProps {
  AdvancedDataSet: any,
  className?: string,
  cRef?: any,
  data: any,
}

const Store = createContext({} as advancedSettingProps);

export function useAdvancedSettingStore() {
  return useContext(Store);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
    data,
  } = props;

  const AdvancedDataSet = useMemo(() => new DataSet(advancedDataSet(data)), [data]);

  const value = {
    ...props,
    AdvancedDataSet,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
