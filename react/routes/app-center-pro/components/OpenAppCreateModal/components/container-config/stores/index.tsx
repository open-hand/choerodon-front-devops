/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import conGroupDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';

interface ContextType {
  cRef: any,
  children: any,
  ConGroupDataSet: any,
  modal?: any,
  detail?: any,
  refresh?: Function,
  isPipeline?: Boolean,
  preJobList?: object[],
}

const Store = createContext({} as ContextType);

export function useContainerConfig() {
  return useContext(Store);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
    isPipeline,
    preJobList,
  } = props;

  const ConGroupDataSet = useMemo(
    () => new DataSet(conGroupDataSet(
      isPipeline,
      preJobList,
    )), [isPipeline, preJobList],
  );

  const value = {
    ...props,
    ConGroupDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
