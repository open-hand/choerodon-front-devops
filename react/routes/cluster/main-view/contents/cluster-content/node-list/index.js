import React, { Fragment } from 'react';
import { Permission, Action } from '@choerodon/boot';
import { Modal, Table } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { useClusterContentStore } from '../stores';
import StatusTags from '../../../../../../components/status-tag';
import RemoveRoleModal from './RoleRemoveForm';
import RemoveNodeModal from './NodeRemoveModal';

import './index.less';

const { Column } = Table;
const NodeList = () => {
  const {
    intlPrefix,
    formatMessage,
    NodeListDs,
    projectId,
    contentStore,
    clusterStore,
  } = useClusterContentStore();

  const refresh = () => {
    NodeListDs.query();
  };

  const {
    getSelectedMenu,
  } = clusterStore;

  const renderStatusName = ({ record }) => {
    const status = record.get('status');
    const nodeName = record.get('nodeName');
    return (
      <>
        <StatusTags name={status} colorCode={status} />
        <Tooltip title={nodeName}>
          <span>
            {nodeName}
          </span>
        </Tooltip>
      </>
    );
  };

  const renderCm = (record, type) => {
    const content = (
      <div className="c7n-cls-table-cm">
        <span className="c7n-cls-up" />
        <span>{`${record.get(`${type}Request`)} (${record.get(`${type}RequestPercentage`)})`}</span>
        <span className="c7n-cls-down" />
        <span className="c7n-cls-table-one-line-omit">{`${record.get(`${type}Limit`)} (${record.get(`${type}LimitPercentage`)})`}</span>
      </div>
    );
    return (
      <Tooltip title={content}>
        {content}
      </Tooltip>
    );
  };

  const renderType = ({ value: type }) => {
    let temp;
    switch (type) {
      case 7:
        temp = 'master,worker,etcd';
        break;
      case 6:
        temp = 'master,etcd';
        break;
      case 5:
        temp = 'master,worker';
        break;
      case 4:
        temp = 'master';
        break;
      case 3:
        temp = 'etcd,worker';
        break;
      case 2:
        temp = 'etcd';
        break;
      case 1:
        temp = 'worker';
        break;
      default:
        break;
    }
    return (
      <Tooltip title={temp}>
        <span>{temp}</span>
      </Tooltip>
    );
  };

  const renderTime = ({ value: time }) => (
    <Tooltip title={time}>
      <span>{time}</span>
    </Tooltip>
  );

  // 移除角色
  const openRemoveRole = (record, roleType) => {
    const nodeName = record.get('nodeName');
    const nodeId = record.get('id');
    Modal.open({
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.node.action.removeRole.${roleType}` }),
      children: <RemoveRoleModal
        nodeName={nodeName}
        projectId={projectId}
        nodeId={nodeId}
        roleType={roleType}
        contentStore={contentStore}
        afterOk={refresh}
      />,
      okText: formatMessage({ id: `${intlPrefix}.node.modal.removeRole` }),
      footer: (okbtn, cancelbtn) => (
        <>
          {cancelbtn}
        </>
      ),
    });
  };

  // 移除节点
  const handleRemoveNode = (record) => {
    const nodeName = record.get('nodeName');
    const nodeId = record.get('id');
    Modal.open({
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.node.modal.cannotDelete` }),
      children: <RemoveNodeModal
        nodeId={nodeId}
        nodeName={nodeName}
        projectId={projectId}
        formatMessage={formatMessage}
        intlPrefix={intlPrefix}
        contentStore={contentStore}
        afterOk={refresh}
      />,
      okCancel: false,
      okText: formatMessage({ id: 'cancel' }),
    });
  };

  const renderNodeOpts = ({ record, dataSet }) => {
    const clusterType = record.get('clusterType');
    const enableDeleteEtcdRole = record.get('enableDeleteEtcdRole');
    const enableDeleteMasterRole = record.get('enableDeleteMasterRole');
    if (clusterType === 'imported') {
      return null;
    }
    const optsData = [
      {
        service: [],
        text: formatMessage({ id: `${intlPrefix}.node.action.removeNode` }),
        action: () => handleRemoveNode(record),
      },
    ];
    if (enableDeleteEtcdRole) {
      optsData.unshift({
        service: [],
        text: formatMessage({ id: `${intlPrefix}.node.action.removeRole.etcd` }),
        action: () => openRemoveRole(record, 'etcd'),
      });
    }
    if (enableDeleteMasterRole) {
      optsData.unshift({
        service: [],
        text: formatMessage({ id: `${intlPrefix}.node.action.removeRole.master` }),
        action: () => openRemoveRole(record, 'master'),
      });
    }
    return (
      <Action placement="bottomRight" data={optsData} />
    );
  };

  const renderCpu = ({ record }) => renderCm(record, 'cpu');
  const renderMemory = ({ record }) => renderCm(record, 'memory');

  return (
    <div className="c7ncd-cluster-table">
      <Table
        dataSet={NodeListDs}
        border={false}
        queryBar="none"
      >
        <Column width={150} header={formatMessage({ id: `${intlPrefix}.node.ip` })} renderer={renderStatusName} />
        <Column width={50} renderer={renderNodeOpts} />
        <Column name="role" minWidth={80} renderer={renderType} />
        <Column header={formatMessage({ id: `${intlPrefix}.node.cpu` })} renderer={renderCpu} />
        <Column header={formatMessage({ id: `${intlPrefix}.node.memory` })} renderer={renderMemory} />
        <Column name="createTime" width={150} renderer={renderTime} />
      </Table>
    </div>
  );
};

export default NodeList;
