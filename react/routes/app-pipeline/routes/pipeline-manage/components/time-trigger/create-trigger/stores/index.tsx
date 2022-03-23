import React, { createContext, useContext, useMemo } from 'react';
import {
  DataSet,
} from 'choerodon-ui/pro';
import createTriggerDataSet from './createTriggerDataSet';
import variableDataSet from './variableDataSet';

interface createTriggerProps {
  CreateTriggerDataSet: any,
  VariableDataSet: any,
}

const Store = createContext({} as createTriggerProps);

export function useCreateTriggerStore() {
  return useContext(Store);
}

export const StoreProvider = (props: any) => {
  const {
    children,
  } = props;

  const CreateTriggerDataSet = useMemo(() => new DataSet(createTriggerDataSet()), []);
  const VariableDataSet = useMemo(() => new DataSet(variableDataSet()), []);

  const value = {
    ...props,
    CreateTriggerDataSet,
    VariableDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
