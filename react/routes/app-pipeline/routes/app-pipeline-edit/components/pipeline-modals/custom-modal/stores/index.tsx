import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import customDataSet, { mapping }
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/custom-modal/stores/customDataSet';

interface customModalProps {
  CustomDataSet: any,
  data: any,
  handleJobAddCallback: any
  modal?: any
}

const Store = createContext({} as customModalProps);

export function useCustomModalStore() {
  return useContext(Store);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
    data,
  } = props;

  const CustomDataSet = useMemo(() => new DataSet(customDataSet()), []);

  useEffect(() => {
    if (data) {
      CustomDataSet?.current?.set(mapping.value.name, data?.script);
    }
  }, []);

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
