import React, {
  createContext, useContext, useMemo, useState,
} from 'react';
import {
  DataSet,
} from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import timeTriggerDataSet from './timeTriggerDataSet';

interface timeTriggerProps {
  TimeTriggerDataSet: any,
  projectId: any,
  appServiceId: any,
}

const Store = createContext({} as timeTriggerProps);

export function useTimeTriggerStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: any) => {
  const {
    AppState: { currentMenuType: { projectId } },
    children,
    appServiceId,
  } = props;

  const TimeTriggerDataSet = useMemo(() => new DataSet(timeTriggerDataSet(appServiceId)), []);

  const value = {
    ...props,
    TimeTriggerDataSet,
    projectId,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
