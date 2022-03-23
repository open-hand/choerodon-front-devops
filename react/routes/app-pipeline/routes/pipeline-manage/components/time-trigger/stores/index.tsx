import React, { createContext, useContext, useMemo } from 'react';
import {
  DataSet,
} from 'choerodon-ui/pro';
import timeTriggerDataSet from './timeTriggerDataSet';

interface timeTriggerProps {
  TimeTriggerDataSet: any,
}

const Store = createContext({} as timeTriggerProps);

export function useTimeTriggerStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const TimeTriggerDataSet = useMemo(() => new DataSet(timeTriggerDataSet()), []);

  const value = {
    ...props,
    TimeTriggerDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
