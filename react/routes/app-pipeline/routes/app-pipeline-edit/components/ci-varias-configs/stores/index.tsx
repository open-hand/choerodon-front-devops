/* eslint-disable max-len */
import React, { createContext, useContext, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import useStore, { StoreProps } from './useStore';
import { CiVariasConfigsStoreContext, ProviderProps } from '../interface';
import FormDataSet from './FormDataSet';

const Store = createContext({} as CiVariasConfigsStoreContext);

export function useCiVariasConfigsStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: ProviderProps) => {
  const {
    children,
  } = props;

  const prefixCls = 'c7ncd-ci-varias-configs' as const;
  const intlPrefix = 'c7ncd.app.pipeline' as const;

  const formatCommon = useFormatCommon();
  const formatAppPipeline = useFormatMessage(intlPrefix);

  const mainStore = useStore();

  const formDs = useMemo(() => new DataSet(FormDataSet({
    formatAppPipeline,
  })), []);

  const value = {
    ...props,
    mainStore,
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
});
