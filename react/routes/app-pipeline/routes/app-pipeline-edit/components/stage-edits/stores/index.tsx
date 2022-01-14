/* eslint-disable max-len */
import React, { createContext, useContext, useState } from 'react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import useStore from './useStore';
import { StageEditsStoreContext, ProviderProps } from '../interface';
import useLoadJobPanel from '../hooks/useLoadJobPanel';

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

  const [currentOpenPanelIdentity, setOpenPanelIdentity] = useState('');

  const value = {
    ...props,
    mainStore,
    prefixCls,
    intlPrefix,
    formatPipelinEdit,
    formatCommon,
    currentOpenPanelIdentity,
    setOpenPanelIdentity,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
