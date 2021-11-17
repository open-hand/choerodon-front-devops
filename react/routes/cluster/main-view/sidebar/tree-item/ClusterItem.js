/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
import React, { useMemo, useState, useEffect } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Action, Choerodon } from '@choerodon/master';
import {
  Modal, Icon, Spin, TextField,
} from 'choerodon-ui/pro';
import { Input, message as UiMessage } from 'choerodon-ui';
import CopyToBoard from 'react-copy-to-clipboard';
import TreeItemService from '@/routes/cluster/main-view/sidebar/tree-item/services';
import { useClusterStore } from '../../../stores';
import { useClusterMainStore } from '../../stores';
import StatusDot from '../../../../../components/status-dot';
import ActivateCluster from '../../contents/cluster-content/modals/activate-cluster';
import { useTreeStore } from './stores';
import { handlePromptError } from '../../../../../utils';
import EditCluster from '../../contents/cluster-content/modals/create-cluster';
import CustomConfirm from '../../../../../components/custom-confirm';

const ActivateClusterModalKey = Modal.key();
const EditClusterModalKey = Modal.key();
const deleteModalKey = Modal.key();
function ClusterItem({
  record,
  name,
  intlPrefix,
  prefixCls,
  intl: { formatMessage },
}) {
  const { treeDs } = useClusterStore();
  const { mainStore, ClusterDetailDs } = useClusterMainStore();

  const { projectId, treeItemStore } = useTreeStore();

  const customConfirm = useMemo(() => new CustomConfirm({ formatMessage }), []);

  function getStatus() {
    const tempStatus = record.get('status');
    switch (tempStatus) {
      case 'running':
        return ['running', 'connect'];
      case 'failed':
        return ['failed', 'failed'];
      case 'operating':
        return ['operating', 'operating'];
      default:
        break;
    }
    return ['disconnect'];
  }

  function freshMenu() {
    treeDs.query();
  }

  async function deleteItem() {
    const code = record.get('code');
    const clusterName = record.get('name');
    const deleteModal = Modal.open({
      key: deleteModalKey,
      title: formatMessage({ id: `${intlPrefix}.action.delete.title` }, { name: clusterName }),
      children: <Spin />,
      movable: false,
      footer: null,
    });
    const res = await mainStore.deleteCheck(projectId, record.get('id'));
    if (res && (res.checkEnv || res.checkPV)) {
      let message = '';
      if (res.checkPV) {
        message = formatMessage({ id: 'c7ncd.cluster.action.can\'t.delete.pv' });
      }
      if (res.checkEnv) {
        message = formatMessage({ id: 'c7ncd.cluster.action.can\'t.delete.env' });
      }
      deleteModal.update({
        title: formatMessage({ id: 'c7ncd.cluster.action.can\'t.delete' }),
        children: message,
        okText: formatMessage({ id: 'iknow' }),
        footer: ((okBtn, cancelBtn) => (
          <>
            {okBtn}
          </>
        )),
      });
    } else {
      const modalContent = (
        <div>
          <FormattedMessage id="cluster.delDes_1" />
          <div
            className={`${prefixCls}-delete-input`}
          >
            <Input
              value={`helm uninstall choerodon-cluster-agent-${code || ''} -n choerodon`}
              readOnly
              copy
            />
          </div>
          <div className={`${prefixCls}-delete-notice`}>
            <Icon type="error" />
            <FormattedMessage id="cluster.delDes_2" />
          </div>
        </div>
      );
      deleteModal.update({
        children: modalContent,
        onOk: handleDelete,
        okCancel: true,
        footer: ((okBtn, cancelBtn) => (
          <>
            {cancelBtn}
            {okBtn}
          </>
        )),
        okText: formatMessage({ id: 'cluster.del.confirm' }),
      });
    }
  }

  // eslint-disable-next-line consistent-return
  async function handleDelete() {
    try {
      const res = await mainStore.deleteCluster({ projectId, clusterId: record.get('id') });
      if (handlePromptError(res, false)) {
        freshMenu();
        mainStore.checkCreate(projectId);
      } else {
        return false;
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  }

  function openEdit(res) {
    Modal.open({
      key: EditClusterModalKey,
      title: formatMessage({ id: `${intlPrefix}.modal.edit` }),
      children: <EditCluster isEdit clusterId={record.data.id} mainStore={mainStore} afterOk={freshMenu} intlPrefix={intlPrefix} formatMessage={formatMessage} treeItemStore={treeItemStore} projectId={projectId} />,
      drawer: true,
      style: {
        width: 380,
      },
      okText: formatMessage({ id: 'save' }),
    });
  }

  async function editItem() {
    openEdit();
  }

  async function activateItem() {
    const res = await treeItemStore.queryActivateClusterShell(projectId, record.get('id'));
    if (handlePromptError(res)) {
      Modal.open({
        key: ActivateClusterModalKey,
        title: formatMessage({ id: `${intlPrefix}.activate.header` }),
        children: <ActivateCluster cmd={res} intlPrefix={intlPrefix} formatMessage={formatMessage} />,
        drawer: true,
        style: {
          width: 380,
        },
        okCancel: false,
        okText: formatMessage({ id: 'close' }),
      });
    }
  }

  const getPrefix = useMemo(() => (
    <StatusDot
      size="small"
      getStatus={getStatus}
    />
  ), [record]);

  const deleteFailedItem = async () => {
    try {
      const res = await mainStore.deleteCluster({ projectId, clusterId: record.get('id') });
      if (handlePromptError(res, false)) {
        freshMenu();
      } else {
        return false;
      }
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };

  const handleClusterRetry = async () => {
    try {
      const res = await treeItemStore.retryCluster(projectId, record.get('id'));
      if (res && res.failed) {
        return res;
      }
      freshMenu();
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };

  const handleDisConnect = async () => {
    const clusterId = record.get('id');
    const res = await TreeItemService.axiosGetDisConnect(projectId, clusterId);
    Modal.open({
      title: '断开连接',
      children: (
        <div>
          <p>复制以下指令至对应集群执行，来断开连接。</p>
          <TextField
            value={res}
            disabled
            suffix={(
              <CopyToBoard
                text={res}
                onCopy={() => {
                  UiMessage.success('复制成功');
                }}
                options={{ format: 'text/plain' }}
              >
                <Icon style={{ cursor: 'pointer' }} type="content_copy" />
              </CopyToBoard>
            )}
            style={{
              width: '100%',
            }}
          />
        </div>
      ),
      okText: '我知道了',
      okCancel: false,
    });
  };

  const getSuffix = useMemo(() => {
    const [status] = getStatus();
    if (status === 'operating') {
      return null;
    }
    if (status === 'failed') {
      const tempData = [{
        service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.retryCluster'],
        text: formatMessage({ id: `${intlPrefix}.action.retry` }),
        action: handleClusterRetry,
      },
      {
        service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.delete'],
        text: formatMessage({ id: `${intlPrefix}.action.delete` }),
        action: deleteFailedItem,
      }];
      return <Action placement="bottomRight" data={tempData} />;
    }
    const Data = [{
      service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.edit'],
      text: formatMessage({ id: `${intlPrefix}.action.edit` }),
      action: editItem,
    }];
    if (status === 'disconnect') {
      Data.unshift({
        service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.active'],
        text: formatMessage({ id: `${intlPrefix}.activate.header` }),
        action: activateItem,
      });
      Data.push({
        service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.delete'],
        text: formatMessage({ id: `${intlPrefix}.action.delete` }),
        action: deleteItem,
      });
    }
    if (status === 'running') {
      Data.push({
        service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.disconnect'],
        text: '断开连接',
        action: handleDisConnect,
      });
    }

    return <Action placement="bottomRight" data={Data} />;
  }, [record]);

  const clearClick = (e) => {
    e.stopPropagation();
  };
  return (
    <>
      {getPrefix}
      <span className={`${prefixCls}-clusterNode-type ${prefixCls}-clusterNode-type-${record.get('type')}`}>
        {record.get('type') === 'created' ? '平台' : '导入'}
      </span>
      {name}
      <div onClick={clearClick} role="none">
        {getSuffix}
      </div>
    </>
  );
}

export default injectIntl(ClusterItem);
