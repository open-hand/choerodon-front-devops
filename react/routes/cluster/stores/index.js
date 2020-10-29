/* eslint-disable max-len */
import React, { createContext, useMemo, useContext } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import useStore from './useStore';
import { itemTypeMappings } from './mappings';
import TreeDataSet from './TreeDataSet';
import useHostClusterStore from './useHostClusterStore';
import NodeDataSet from './NodeDataSet';
import FormDataSet from './createClusterByHostsFormDataSet';
import publicNodeDataSet from './publicNodeDataSet';

const Store = createContext();

export function useClusterStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const { AppState: { currentMenuType: { id: projectId } }, children, intl: { formatMessage } } = props;
    const clusterStore = useStore();
    const itemType = useMemo(() => itemTypeMappings, []);
    const treeDs = useMemo(() => new DataSet(TreeDataSet(clusterStore, projectId)), [projectId]);

    const intlPrefix = 'c7ncd.cluster';

    const {
      getSelectedMenu: { id: clusterId },
    } = clusterStore;

    const createHostClusterStore = useHostClusterStore();

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
      createHostClusterStore,
      projectId,
    }), [projectId]));

    const addNodesDs = useMemo(() => new DataSet(NodeDataSet({
      ...props,
      accountDs,
      formatMessage,
      intlPrefix,
      createHostClusterStore,
      isModal: true,
      clusterId,
      projectId,
    }), [projectId, clusterId]));

    const publicNodeDs = useMemo(() => new DataSet(publicNodeDataSet({
      ...props,
      accountDs,
      formatMessage,
      intlPrefix,
      createHostClusterStore,
      projectId,
    })), [projectId]);

    const formDs = useMemo(() => new DataSet(FormDataSet({
      createHostClusterStore, projectId, formatMessage, intlPrefix, nodesDs, publicNodeDs,
    })), [projectId]);

    const value = {
      ...props,
      prefixCls: 'c7ncd-cluster',
      intlPrefix,
      permissions: [],
      clusterStore,
      itemType,
      treeDs,
      formatMessage,
      nodesTypeDs,
      addNodesDs,
      formDs,
      nodesDs,
      projectId,
      createHostClusterStore,
      publicNodeDs,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
