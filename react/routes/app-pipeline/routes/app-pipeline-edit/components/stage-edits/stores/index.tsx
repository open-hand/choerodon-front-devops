/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { inject } from 'mobx-react';
import useStore, { StoreProps } from './useStore';
import { StageEditsStoreContext, ProviderProps } from '../interface';

const Store = createContext({} as StageEditsStoreContext);

export function useStageEditsStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: ProviderProps) => {
  const {
    children,
  } = props;

  const prefixCls = 'c7ncd-stage-edits' as const;
  const intlPrefix = 'c7ncd.app.pipeline.edit' as const;

  const formatCommon = useFormatCommon();
  const formatPipelinEdit = useFormatMessage(intlPrefix);

  const mainStore = useStore();

  const value = {
    ...props,
    mainStore,
    prefixCls,
    intlPrefix,
    formatPipelinEdit,
    formatCommon,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
