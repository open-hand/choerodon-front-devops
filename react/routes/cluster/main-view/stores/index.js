import React, {
  useContext, createContext, useMemo, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { useClusterStore } from '../../stores';
import useStore from './useStore';
import ClusterDetailDataSet from './ClusterDetailDataSet';

const Store = createContext();

export function useClusterMainStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props) => {
  const { AppState: { currentMenuType: { projectId } }, children } = props;
  const { clusterStore: { getSelectedMenu: { id } } } = useClusterStore();

  const ClusterDetailDs = useMemo(() => new DataSet(ClusterDetailDataSet()), []);
  const mainStore = useStore();

  useEffect(() => {
    if (id) {
      ClusterDetailDs.transport.read.url = `devops/v1/projects/${projectId}/clusters/${id}`;
      ClusterDetailDs.query();
    }
  }, [projectId, id]);

  useEffect(() => {
    mainStore.checkCreate(projectId);
  }, [projectId]);

  const value = {
    ...props,
    prefixCls: 'c7ncd-cluster',
    intlPrefix: 'c7ncd.cluster',
    permissions: [],
    mainStore,
    ClusterDetailDs,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
