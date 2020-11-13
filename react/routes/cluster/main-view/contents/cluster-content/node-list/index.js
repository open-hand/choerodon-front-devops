import React, { Fragment } from 'react';
import { Permission, Action } from '@choerodon/boot';
import { Modal, Table, Icon } from 'choerodon-ui/pro';
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

  const renderStatusName = ({ record }) => {
    const status = record.get('status');
    const nodeName = record.get('nodeName');
    const operatingStatus = record.get('operatingStatus');
    const errorMsg = record.get('errorMsg');
    const outerNodeFlag = record.get('outerNodeFlag');
    return (
      <>
        <StatusTags name={status} colorCode={status} />
        <Tooltip title={nodeName}>
          <span>
            {nodeName}
          </span>
        </Tooltip>
        {
          outerNodeFlag && (
            <span className="c7ncd-cluster-outerNodeFlag">
              公网
            </span>
          )
        }
        {
          operatingStatus === 'failed'
          && (
          <Tooltip title={errorMsg}>
            <Icon
              type="info"
              style={{
                color: '#F76776 ',
                marginLeft: '7px',
              }}
            />
          </Tooltip>
          )
        }
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

  const renderType = ({ value: type }) => (
    <Tooltip title={type}>
      <span>{type}</span>
    </Tooltip>
  );

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
        formatMessage={formatMessage}
        intlPrefix={intlPrefix}
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
        roleType="worker"
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
    const enableDeleteNode = record.get('enableDeleteNode');
    if (clusterType === 'imported' || clusterStore.getSelectedMenu?.status === 'operating') {
      return null;
    }
    const optsData = [];
    if (enableDeleteNode) {
      optsData.unshift({
        service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.deleteNode'],
        text: formatMessage({ id: `${intlPrefix}.node.action.removeNode` }),
        action: () => handleRemoveNode(record),
      });
    }
    if (enableDeleteEtcdRole) {
      optsData.unshift({
        service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.deleteEtcdRole'],
        text: formatMessage({ id: `${intlPrefix}.node.action.removeRole.etcd` }),
        action: () => openRemoveRole(record, 'etcd'),
      });
    }
    if (enableDeleteMasterRole) {
      optsData.unshift({
        service: ['choerodon.code.project.deploy.cluster.cluster-management.ps.deleteMasterRole'],
        text: formatMessage({ id: `${intlPrefix}.node.action.removeRole.master` }),
        action: () => openRemoveRole(record, 'master'),
      });
    }
    if (!optsData.length) return null;
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
