/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { Loading } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { useReactive } from 'ahooks';
import useStore, { StoreProps } from './useStore';
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
