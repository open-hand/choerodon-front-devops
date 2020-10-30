/* eslint-disable max-len */
import React, { useMemo } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Action, Choerodon } from '@choerodon/boot';
import { Modal, Icon, Spin } from 'choerodon-ui/pro';
import { Input } from 'choerodon-ui';
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
              value={`helm del choerodon-cluster-agent-${code || ''} --purge`}
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
            {okBtn}
            {cancelBtn}
          </>
        )),
        okText: formatMessage({ id: 'cluster.del.confirm' }),
        okProps: { color: 'red' },
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

  const getSuffix = useMemo(() => {
    const [status] = getStatus();
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
