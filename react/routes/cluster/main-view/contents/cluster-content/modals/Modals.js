/* eslint-disable max-len */
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import HeaderButtons from '../../../../../../components/header-buttons';
import { useClusterContentStore } from '../stores';
import { useClusterStore } from '../../../../stores';
import { useClusterMainStore } from '../../../stores';
import { useModalStore } from './stores';
import CreateCluster from './create-cluster';
import CreateClusterByHost from './create-clusterByHost';
import CreateNodes from './create-nodes';
import PermissionManage from './permission-manage';
import Tips from '../../../../../../components/new-tips';

import '../../../../../../components/dynamic-select/style/index.less';

const modalKey1 = Modal.key();
const modalKey2 = Modal.key();

const ClusterModals = observer(() => {
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    clusterStore: {
      getSelectedMenu: { id },
    },
    clusterStore,
    AppState: { currentMenuType: { id: projectId } },
    treeDs,
    clusterId,
    nodesTypeDs,
    addNodesDs,
    formDs,
    nodesDs,
    publicNodeDs,
    createHostClusterStore,
  } = useClusterStore();

  const {
    contentStore,
    tabs: {
      NODE_TAB, ASSIGN_TAB, COMPONENT_TAB, MONITOR_TAB,
    },
    PermissionDs,
    NodeListDs,
    ClusterDetailDs,
  } = useClusterContentStore();
  const { getTabKey } = contentStore;

  const { mainStore } = useClusterMainStore();
  const {
    modalStore,
    NonPermissionDs,
  } = useModalStore();

  function permissionUpdate(data) {
    const record = ClusterDetailDs.current;
    if (record) {
      const objectVersionNumber = record.get('objectVersionNumber');
      const PermissionData = {
        projectId,
        clusterId: id,
        objectVersionNumber,
        ...data,
      };
      return modalStore.permissionUpdate(PermissionData);
    }
    return false;
  }

  function refresh() {
    resreshTree();
    ClusterDetailDs.query();
    switch (getTabKey) {
      case NODE_TAB:
        NodeListDs.query();
        break;
      case ASSIGN_TAB:
        PermissionDs.query();
        break;
      case COMPONENT_TAB:
        contentStore.loadComponentList(projectId, id);
        break;
      case MONITOR_TAB:
        contentStore.loadGrafanaUrl(projectId, id);
        break;
      default:
    }
  }
  function resreshTree() {
    treeDs.query();
    mainStore.checkCreate(projectId);
  }

  function refreshPermission() {
    contentStore.setTabKey(ASSIGN_TAB);
    ClusterDetailDs.query();
    NonPermissionDs.query();
  }

  function openCreateByNodes() {
    Modal.open({
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.modal.createByNodes` }),
      children: <CreateNodes
        prefixCls={prefixCls}
        intlPrefix={intlPrefix}
        formatMessage={formatMessage}
        mainStore={mainStore}
        projectId={projectId}
        afterOk={resreshTree}
        nodesTypeDs={nodesTypeDs}
        nodesDs={addNodesDs}
        modalStore={modalStore}
        clusterId={clusterId}
        createHostClusterMainStore={createHostClusterStore}

      />,
      drawer: true,
      className: `${prefixCls}-nodesCreate-modal`,
      style: {
        width: '740px',
      },
      okText: formatMessage({ id: 'add' }),
      onCancel: () => {
        addNodesDs.reset();
      },
    });
  }

  const renderClusterHostTitle = (title, text) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ marginRight: '4px' }}>{title}</span>
      <Tips helpText={text} />
    </div>
  );

  function openCreateByHost() {
    Modal.open({
      key: Modal.key(),
      className: `${prefixCls}-createByHost-modal`,
      title: renderClusterHostTitle(formatMessage({ id: `${intlPrefix}.modal.createByHost` }), '此方式通过维护节点来新建集群'),
      children: <CreateClusterByHost
        formDs={formDs}
        afterOk={resreshTree}
        prefixCls={prefixCls}
        intlPrefix={intlPrefix}
        formatMessage={formatMessage}
        projectId={projectId}
        nodesTypeDs={nodesTypeDs}
        nodesDs={nodesDs}
        createHostClusterMainStore={createHostClusterStore}
        publicNodeDs={publicNodeDs}
      />,
      drawer: true,
      style: {
        width: '740px',
      },
      destroyOnClose: true,
      okText: formatMessage({ id: 'create' }),
      onCancel: () => {
        nodesDs.reset();
        formDs.reset();
      },
    });
  }

  function openCreate() {
    Modal.open({
      key: modalKey1,
      title: renderClusterHostTitle(formatMessage({ id: `${intlPrefix}.modal.create` }), '用于连接已有的k8s集群'),
      children: <CreateCluster afterOk={resreshTree} prefixCls={prefixCls} intlPrefix={intlPrefix} formatMessage={formatMessage} mainStore={mainStore} projectId={projectId} />,
      drawer: true,
      style: modalStyle,
      okText: formatMessage({ id: `${intlPrefix}.modal.connect` }),
    });
  }

  function openPermission() {
    Modal.open({
      key: modalKey2,
      title: <Tips
        helpText={formatMessage({ id: `${intlPrefix}.permission.tips` })}
        title={formatMessage({ id: `${intlPrefix}.modal.permission` })}
      />,
      drawer: true,
      style: modalStyle,
      className: 'c7ncd-modal-wrapper',
      children: <PermissionManage
        refreshPermission={refreshPermission}
        onOk={permissionUpdate}
        clusterDetail={ClusterDetailDs.current}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        formatMessage={formatMessage}
        PermissionDs={PermissionDs}
        NonPermissionDs={NonPermissionDs}
      />,
    });
  }

  function getButtons() {
    const { getCanCreate } = mainStore;
    return [{
      name: formatMessage({ id: `${intlPrefix}.modal.create` }),
      permissions: ['choerodon.code.project.deploy.cluster.cluster-management.ps.create'],
      icon: 'link',
      handler: openCreate,
      display: true,
      group: 1,
      disabled: !getCanCreate,
      disabledMessage: formatMessage({ id: `${intlPrefix}.modal.create.disabled` }),
    }, {
      name: formatMessage({ id: `${intlPrefix}.modal.createByHost` }),
      permissions: ['choerodon.code.project.deploy.cluster.cluster-management.ps.create'],
      icon: 'playlist_add',
      handler: openCreateByHost,
      display: true,
      group: 1,
      disabled: !getCanCreate,
      disabledMessage: formatMessage({ id: `${intlPrefix}.modal.create.disabled` }),
    }, {
      name: formatMessage({ id: `${intlPrefix}.modal.permission` }),
      permissions: ['choerodon.code.project.deploy.cluster.cluster-management.ps.permission-manage'],
      icon: 'authority',
      handler: openPermission,
      display: true,
      group: 1,
    }, clusterStore.getSelectedMenu.type === 'created' && {
      name: formatMessage({ id: `${intlPrefix}.modal.createByNodes` }),
      icon: 'playlist_add',
      handler: openCreateByNodes,
      display: true,
      group: 2,
    }, {
      name: formatMessage({ id: 'refresh' }),
      icon: 'refresh',
      handler: refresh,
      display: true,
      group: 2,
    }];
  }

  return <HeaderButtons items={getButtons()} />;
});

export default ClusterModals;
