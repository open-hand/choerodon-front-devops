/* eslint-disable max-len */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro/lib';
import { injectIntl } from 'react-intl';
import useStore from './useStore';
import NonPermissionDataSet from './NonPermissionDataSet';
import { useClusterContentStore } from '../../stores';
import { useClusterMainStore } from '../../../../stores';
import FormDataSet from './createClusterByHostsFormDataSet';
import NodeDataSet from './NodeDataSet';

const Store = createContext();

export function useModalStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl((props) => {
  const { children, intl: { formatMessage } } = props;
  const modalStore = useStore();
  const { projectId, clusterId } = useClusterContentStore();
  const NonPermissionDs = useMemo(() => new DataSet(NonPermissionDataSet()), []);

  const { mainStore } = useClusterMainStore();

  const intlPrefix = 'c7ncd.cluster';

  const accountDs = useMemo(() => new DataSet({
    data: [
      {
        text: formatMessage({ id: `${intlPrefix}.nodesCreate.account.password` }),
        value: 'accountPassword',
      },
      {
        text: formatMessage({ id: `${intlPrefix}.nodesCreate.account.token` }),
        value: 'publickey',
      },
    ],
    selection: 'single',
  }), []);

  const nodesTypeDs = useMemo(() => new DataSet({
    data: [
      {
        text: 'master',
        value: 'master',
      },
      {
        text: 'etcd',
        value: 'etcd',
      },
      {
        text: 'worker',
        value: 'worker',
      },
    ],
    selection: 'multiple',
  }), []);

  const nodesDs = useMemo(() => new DataSet(NodeDataSet({
    ...props,
    accountDs,
    formatMessage,
    intlPrefix,
    modalStore,
    projectId,
  }), [projectId]));

  const addNodesDs = useMemo(() => new DataSet(NodeDataSet({
    ...props,
    accountDs,
    formatMessage,
    intlPrefix,
    modalStore,
    isModal: true,
    clusterId,
    projectId,
  }), [projectId]));

  const formDs = useMemo(() => new DataSet(FormDataSet({
    mainStore, projectId, formatMessage, intlPrefix, nodesDs, modalStore,
  })), [projectId]);

  useEffect(() => {
    NonPermissionDs.transport.read.url = `/devops/v1/projects/${projectId}/clusters/${clusterId}/permission/list_non_related`;
  }, [projectId, clusterId]);

  const value = {
    ...props,
    permissions: [],
    modalStore,
    NonPermissionDs,
    formDs,
    nodesTypeDs,
    nodesDs,
    addNodesDs,
    clusterId,
    projectId,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
