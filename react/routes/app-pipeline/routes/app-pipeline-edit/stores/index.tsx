/* eslint-disable max-len */
import React, {
  createContext, useContext, useState,
} from 'react';
import { useRouteMatch } from 'react-router';
import { inject } from 'mobx-react';
import { useFormatCommon, useFormatMessage, useQueryString } from '@choerodon/master';
import { useSetState } from 'ahooks';
import { Loading } from '@choerodon/components';
import { AppPipelineEditStoreContext, ProviderProps } from '../interface';
import {
  TAB_ADVANCE_SETTINGS, TAB_BASIC, TAB_CI_CONFIG, TAB_FLOW_CONFIG,
} from './CONSTANTS';
import useLoadStageData from '../hooks/useLoadStageData';
import useLoadBasicInfo from '../hooks/useLoadBasicInfo';
import useLoadCiVariasLists from '../hooks/useLoadCiVariasLists';
import useLoadAdvancedSetting from '../hooks/useLoadAdvancedSetting';
import { TabkeyTypes } from '@/routes/app-pipeline/interface';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

const Store = createContext({} as AppPipelineEditStoreContext);

export function useAppPipelineEditStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')((props: ProviderProps) => {
  const {
    children,
  } = props;

  const {
    defaultTabKey,
    level,
  } = usePipelineContext();

  const { searchTabKey } = useQueryString();

  const {
    params: {
      id, type = 'create',
    },
  } = useRouteMatch<any>();

  const [currentKey, setTabKey] = useState<TabkeyTypes>(searchTabKey || defaultTabKey || TAB_FLOW_CONFIG);

  const [tabsData, setTabsDataState] = useSetState<Partial<Record<TabkeyTypes, unknown>>>({});

  const { isFetching: isStagesLoading } = useLoadStageData({ type, id, setTabsDataState });

  const { isFetching: isBasicLoading } = useLoadBasicInfo({ type, id, setTabsDataState });

  const { isFetching: isCiVariasLoading } = useLoadCiVariasLists({ type, id, setTabsDataState });

  const { isFetching: isAdvancedLoading } = useLoadAdvancedSetting({
    type, id, setTabsDataState, level, tabsData,
  });

  const loadingMap = {
    [TAB_BASIC]: isBasicLoading,
    [TAB_FLOW_CONFIG]: isStagesLoading,
    [TAB_CI_CONFIG]: isCiVariasLoading,
    [TAB_ADVANCE_SETTINGS]: isAdvancedLoading,
  };

  const prefixCls = 'c7ncd-app-pipeline-edit' as const;
  const intlPrefix = 'c7ncd.app.pipeline.edit' as const;

  const formatCommon = useFormatCommon();
  const formatAppPipelineEdit = useFormatMessage(intlPrefix);

  if (loadingMap[currentKey]) {
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
