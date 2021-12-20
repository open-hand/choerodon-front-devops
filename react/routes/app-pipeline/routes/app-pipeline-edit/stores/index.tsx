/* eslint-disable max-len */
import React, {
  createContext, useContext, useEffect, useState,
} from 'react';
import { useRouteMatch } from 'react-router';
import { inject } from 'mobx-react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { useSetState, useSessionStorageState } from 'ahooks';
import { Loading } from '@choerodon/components';
import { AppPipelineEditStoreContext, ProviderProps, TabkeyTypes } from '../interface';
import { TAB_BASIC, TAB_FLOW_CONFIG } from './CONSTANTS';
import { PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY } from '@/routes/app-pipeline/stores/CONSTANTS';
import useLoadStageData from '../hooks/useLoadStageData';

const Store = createContext({} as AppPipelineEditStoreContext);

export function useAppPipelineEditStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: ProviderProps) => {
  const {
    children,
  } = props;

  const {
    params: {
      id, type = 'create',
    },
  } = useRouteMatch<any>();

  const [currentKey, setTabKey] = useState<TabkeyTypes>(TAB_FLOW_CONFIG);

  const [tabsData, setTabsDataState] = useSetState<Partial<Record<TabkeyTypes, unknown>>>({});

  const [localData] = useSessionStorageState<any>(PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY);

  // 这个是编辑的时候才会触发这个load去加载数据
  const { data: stageObject = {}, isLoading, isSuccess } = useLoadStageData({ type, id });

  useEffect(() => {
    if (isSuccess) {
      setTabsDataState({
        [TAB_FLOW_CONFIG]: stageObject?.devopsCiStageVOS || [],
      });
    }
  }, [stageObject, isSuccess]);

  useEffect(() => {
    setTabsDataState({
      [TAB_BASIC]: localData?.basicInfo || {},
    });
  }, []);

  const prefixCls = 'c7ncd-app-pipeline-edit' as const;
  const intlPrefix = 'c7ncd.app.pipeline.edit' as const;

  const formatCommon = useFormatCommon();
  const formatAppPipelineEdit = useFormatMessage(intlPrefix);

  if (isLoading) {
    return <Loading type="c7n" />;
  }

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
    type,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
