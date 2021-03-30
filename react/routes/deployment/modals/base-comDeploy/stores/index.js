import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import baseDeployDataSet from './baseDeployDataSet';
import hostSettingDataSet from './hostSettingDataSet';
import paramSettingDataSet from './paramSettingDataSet';
import useStore from './useStore';
import pvLabelsDataSet from './pvLabelsDataSet';

const Store = createContext();

export function useBaseComDeployStore() {
  return useContext(Store);
}

export const StoreProvider = inject('AppState')(
  observer((props) => {
    const {
      AppState: { currentMenuType: { projectId } },
      children,
      random,
    } = props;

    const BaseComDeployStore = useStore();

    const HostSettingDataSet = useMemo(
      () => new DataSet(hostSettingDataSet(projectId, BaseComDeployStore)), [projectId],
    );
    const BaseDeployDataSet = useMemo(
      () => new DataSet(baseDeployDataSet(
        projectId,
        HostSettingDataSet,
        BaseComDeployStore,
      )), [projectId, random],
    );
    const ParamSettingDataSet = useMemo(
      () => new DataSet(paramSettingDataSet(BaseDeployDataSet)), [BaseDeployDataSet],
    );
    const PVLabelsDataSet = useMemo(() => new DataSet(pvLabelsDataSet()), []);

    const value = {
      ...props,
      BaseDeployDataSet,
      HostSettingDataSet,
      ParamSettingDataSet,
      BaseComDeployStore,
      PVLabelsDataSet,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
);
