/* eslint-disable max-len */
import React, { createContext, useContext, useState } from 'react';
import { inject } from 'mobx-react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { useSetState } from 'ahooks';
import { AppPipelineEditStoreContext, ProviderProps, TabkeyTypes } from '../interface';
import { TAB_FLOW_CONFIG } from './CONSTANTS';

const Store = createContext({} as AppPipelineEditStoreContext);

export function useAppPipelineEditStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: ProviderProps) => {
  const {
    children,
  } = props;

  const [currentKey, setTabKey] = useState<TabkeyTypes>(TAB_FLOW_CONFIG);

  const [tabsData, setTabsDataState] = useSetState<Partial<Record<TabkeyTypes, unknown>>>({});

  const prefixCls = 'c7ncd-app-pipeline-edit' as const;
  const intlPrefix = 'c7ncd.app.pipeline.edit' as const;

  const formatCommon = useFormatCommon();
  const formatAppPipelineEdit = useFormatMessage(intlPrefix);

  const value = {
    ...props,
    prefixCls,
    intlPrefix,
    formatAppPipelineEdit,
    formatCommon,
    currentKey,
    setTabKey,
    tabsData,
    setTabsDataState,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
