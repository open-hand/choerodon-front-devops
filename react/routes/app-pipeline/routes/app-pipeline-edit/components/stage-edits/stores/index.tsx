/* eslint-disable max-len */
import React, { createContext, useContext } from 'react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { Loading } from '@choerodon/components';
import useStore from './useStore';
import { StageEditsStoreContext, ProviderProps } from '../interface';
import useLoadStageData from '../hooks/useLoadStageData';

const Store = createContext({} as StageEditsStoreContext);

export function useStageEditsStore() {
  return useContext(Store);
}

export const StoreProvider = (props: ProviderProps) => {
  const {
    children,
  } = props;

  const { data = [], isLoading } = useLoadStageData();

  const prefixCls = 'c7ncd-stage-edits' as const;
  const intlPrefix = 'c7ncd.app.pipeline.edit' as const;

  const formatCommon = useFormatCommon();
  const formatPipelinEdit = useFormatMessage(intlPrefix);

  const mainStore = useStore();

  if (isLoading) {
    return <Loading type="c7n" />;
  }

  const value = {
    ...props,
    mainStore,
    prefixCls,
    intlPrefix,
    formatPipelinEdit,
    formatCommon,
    sourceData: data,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
