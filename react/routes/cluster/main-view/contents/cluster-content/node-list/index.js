import React, { Fragment } from 'react';
import { Permission, Action } from '@choerodon/boot';
import { Modal, Table } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { useClusterContentStore } from '../stores';
import StatusTags from '../../../../../../components/status-tag';
import RemoveForm from './RoleRemoveForm';

import './index.less';

const { Column } = Table;
const NodeList = () => {
  const {
    intlPrefix,
    formatMessage,
    NodeListDs,
  } = useClusterContentStore();

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

  const openRemoveRole = (record) => {
    const nodeName = record.get('nodeName');
    Modal.open({
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.node.action.removeRole` }),
      children: <RemoveForm nodeName={nodeName} />,
      okText: formatMessage({ id: `${intlPrefix}.node.modal.removeRole` }),
      okProps: {
        color: 'red',
      },
      cancelProps: {
        color: 'dark',
      },
    });
  };

  const openRemoveNode = (nodeName, nodeType) => {
    Modal.open({
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.node.modal.cannotDelete` }),
      children: `节点“${nodeName}”为集群下唯一的worker节点，无法删除`,
      okCancel: false,
      okText: formatMessage({ id: 'iknow' }),
    });
  };

  const handleRemoveNode = (record, dataSet) => {
    openRemoveNode(record.get('nodeName'));
  };

  const renderNodeOpts = ({ record, dataSet }) => {
    const optsData = [
      {
        service: [],
        text: formatMessage({ id: `${intlPrefix}.node.action.removeRole` }),
        action: () => openRemoveRole(record),
      },
      {
        service: [],
        text: formatMessage({ id: `${intlPrefix}.node.action.removeNode` }),
        action: () => handleRemoveNode(record, dataSet),
      },
    ];
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
        <Column name="type" minWidth={80} renderer={renderType} />
        <Column header={formatMessage({ id: `${intlPrefix}.node.cpu` })} renderer={renderCpu} />
        <Column header={formatMessage({ id: `${intlPrefix}.node.memory` })} renderer={renderMemory} />
        <Column name="createTime" width={150} renderer={renderTime} />
      </Table>
    </div>
  );
};

export default NodeList;
