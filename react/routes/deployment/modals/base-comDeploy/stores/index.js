import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import baseDeployDataSet from './baseDeployDataSet';
import hostSettingDataSet from './hostSettingDataSet';
import paramSettingDataSet from './paramSettingDataSet';
import serviceVersionDataSet from './serviceVersionDataSet';
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
      () => new DataSet(
        hostSettingDataSet(
          projectId,
          BaseComDeployStore,
          random,
        ),
      ), [projectId, random],
    );
    const ServiceVersionDataSet = useMemo(() => new DataSet(serviceVersionDataSet()), []);
    const BaseDeployDataSet = useMemo(
      () => new DataSet(baseDeployDataSet(
        projectId,
        HostSettingDataSet,
        BaseComDeployStore,
        ServiceVersionDataSet,
      )), [projectId, random],
    );
    const ParamSettingDataSet = useMemo(
      () => new DataSet(paramSettingDataSet(BaseDeployDataSet)), [BaseDeployDataSet],
    );
    const PVLabelsDataSet = useMemo(
      () => new DataSet(pvLabelsDataSet(
        projectId,
        BaseDeployDataSet,
        BaseComDeployStore,
      )), [
        projectId,
        BaseDeployDataSet],
    );

    const value = {
      ...props,
      BaseDeployDataSet,
      HostSettingDataSet,
      ParamSettingDataSet,
      BaseComDeployStore,
      PVLabelsDataSet,
      ServiceVersionDataSet,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
);
