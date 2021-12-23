/* eslint-disable max-len */
import React, {
  createContext, useContext, useState,
} from 'react';
import { useRouteMatch } from 'react-router';
import { inject } from 'mobx-react';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import { useSetState } from 'ahooks';
import { Loading } from '@choerodon/components';
import { AppPipelineEditStoreContext, ProviderProps } from '../interface';
import { TAB_FLOW_CONFIG } from './CONSTANTS';
import useLoadStageData from '../hooks/useLoadStageData';
import useLoadBasicInfo from '../hooks/useLoadBasicInfo';
import useLoadCiVariasLists from '../hooks/useLoadCiVariasLists';
import useLoadAdvancedSetting from '../hooks/useLoadAdvancedSetting';
import { TabkeyTypes } from '@/routes/app-pipeline/interface';

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

  const { isLoading: isAdvancedLoading } = useLoadAdvancedSetting({ type, id, setTabsDataState });

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
