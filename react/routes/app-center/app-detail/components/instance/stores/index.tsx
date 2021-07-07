import React, {
  createContext, ReactElement, useContext, useMemo,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import PodsDataset from '@/routes/resource/main-view/contents/instance/stores/PodsDataSet';
import useStore from './useStore';
import BaseInfoDataSet from './BaseInfoDataSet';
import instanceListDataSet from './instaneListDataSet';
import DetailsStore from './DetailsStore';
import CasesDataSet from './CasesDataSet';
import PodsDataSet from './PodsDataSet';

interface ContextProps {
  children: ReactElement,
  AppState: {
    currentMenuType: {
      projectId: number | string,
    }
  },
  InstanceListDataSet: DataSet,
  detailsStore: any,
  baseDs: DataSet,
  casesDs: DataSet,
  intl: any,
  podsDs: any,
  istStore: any,
}

const Store = createContext({} as ContextProps);

export function useAppCenterInstanceStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props: ContextProps) => {
  const {
    children,
    AppState: {
      currentMenuType: {
        projectId,
      },
    },
    intl,
  } = props;

  const intlPrefix = 'c7ncd.deployment';
  const prefixCls = 'c7ncd-deployment';

  const {
    mainStore,
    appServiceId,
  } = useAppCenterDetailStore();

  const detailsStore = useMemo(() => new DetailsStore(), []);

  // @ts-ignore
  const baseDs = useMemo(() => new DataSet(BaseInfoDataSet()), []);
  // @ts-ignore
  const casesDs = useMemo(() => new DataSet(CasesDataSet()), []);
  // @ts-ignore
  const podsDs = useMemo(() => new DataSet(PodsDataset({
    intl,
    intlPrefix,
  })), []);

  const istStore = useStore({ defaultKey: 'event' });

  const InstanceListDataSet = useMemo(
    () => new DataSet(
      instanceListDataSet(
        projectId,
        mainStore,
        appServiceId,
      ),
    ), [projectId, appServiceId, mainStore.getSelectedEnv],
  );

  const value = {
    ...props,
    InstanceListDataSet,
    detailsStore,
    baseDs,
    intlPrefix,
    casesDs,
    podsDs,
    prefixCls,
    istStore,
  };

  return (
    <Store.Provider value={value}>
      { children }
    </Store.Provider>
  );
})));
