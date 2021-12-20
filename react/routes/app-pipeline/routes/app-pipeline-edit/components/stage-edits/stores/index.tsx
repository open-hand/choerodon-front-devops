/* eslint-disable max-len */
import React, { createContext, useContext } from 'react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { useReactive } from 'ahooks';
import useStore from './useStore';
import { StageEditsStoreContext, ProviderProps } from '../interface';
import useLoadJobPanel from '../hooks/useLoadJobPanel';
import useTabData from '../../../hooks/useTabData';

const Store = createContext({} as StageEditsStoreContext);

export function useStageEditsStore() {
  return useContext(Store);
}

export const StoreProvider = (props: ProviderProps) => {
  const {
    children,
  } = props;

  const prefixCls = 'c7ncd-stage-edits' as const;
  const intlPrefix = 'c7ncd.app.pipeline.edit' as const;

  const formatCommon = useFormatCommon();
  const formatPipelinEdit = useFormatMessage(intlPrefix);
  // 加载job下拉面板数据
  useLoadJobPanel();

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
};
