/* eslint-disable max-len */
import React, { createContext, useContext } from 'react';
import { inject } from 'mobx-react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { AppPipelineEditStoreContext, ProviderProps } from '../interface';

const Store = createContext({} as AppPipelineEditStoreContext);

export function useAppPipelineEditStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: ProviderProps) => {
  const {
    children,
  } = props;

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
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
