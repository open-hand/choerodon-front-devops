/* eslint-disable max-len */
import React, {
  createContext, useContext, useEffect, useState,
} from 'react';
import { useRouteMatch } from 'react-router';
import { inject } from 'mobx-react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { useSetState } from 'ahooks';
import { Loading } from '@choerodon/components';
import { initCustomFunc } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores';
import { AppPipelineEditStoreContext, ProviderProps, TabkeyTypes } from '../interface';
import { TAB_FLOW_CONFIG, TAB_ADVANCE_SETTINGS } from './CONSTANTS';
import useLoadStageData from '../hooks/useLoadStageData';
import useLoadBasicInfo from '../hooks/useLoadBasicInfo';
import useLoadCiVariasLists from '../hooks/useLoadCiVariasLists';

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

  const { isLoading } = useLoadStageData({ type, id, setTabsDataState });

  useLoadBasicInfo({ type, id, setTabsDataState });

  useLoadCiVariasLists({ type, id, setTabsDataState });

  useEffect(() => {
    async function initAdvancedSetting() {
      const res = await initCustomFunc();
      setTabsDataState({
        [TAB_ADVANCE_SETTINGS]: {
          devopsCiPipelineFunctionDTOList: res,
        },
      });
    }
    initAdvancedSetting();
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
