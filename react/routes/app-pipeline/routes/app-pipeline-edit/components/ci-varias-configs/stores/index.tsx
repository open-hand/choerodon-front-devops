/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { CiVariasConfigsStoreContext, ProviderProps } from '../interface';
import FormDataSet from './FormDataSet';
import useTabData from '../../../hooks/useTabData';

const Store = createContext({} as CiVariasConfigsStoreContext);

export function useCiVariasConfigsStore() {
  return useContext(Store);
}

export const StoreProvider = (props: ProviderProps) => {
  const {
    children,
  } = props;

  const prefixCls = 'c7ncd-ci-varias-configs' as const;
  const intlPrefix = 'c7ncd.app.pipeline' as const;

  const [_savedData, setSavedData] = useTabData();

  const formatCommon = useFormatCommon();
  const formatAppPipeline = useFormatMessage(intlPrefix);

  const formDs = useMemo(() => new DataSet(FormDataSet({
    formatAppPipeline,
    setSavedData,
  })), []);

  const value = {
    ...props,
    prefixCls,
    intlPrefix,
    formatAppPipeline,
    formatCommon,
    formDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
