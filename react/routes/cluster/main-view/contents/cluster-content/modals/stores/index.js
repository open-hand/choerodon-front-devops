/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro/lib';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import useStore from './useStore';
import NonPermissionDataSet from './NonPermissionDataSet';
import { useClusterContentStore } from '../../stores';

const Store = createContext();

export function useModalStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(observer((props) => {
  const { children, intl: { formatMessage } } = props;
  const modalStore = useStore();
  const { projectId, clusterId } = useClusterContentStore();
  const NonPermissionDs = useMemo(() => new DataSet(NonPermissionDataSet()), []);

  useEffect(() => {
    NonPermissionDs.transport.read.url = `/devops/v1/projects/${projectId}/clusters/${clusterId}/permission/list_non_related`;
  }, [projectId, clusterId]);

  const value = {
    ...props,
    permissions: [],
    modalStore,
    NonPermissionDs,
    clusterId,
    projectId,
    formatMessage,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
