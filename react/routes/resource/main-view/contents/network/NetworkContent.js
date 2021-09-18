import React, { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import {
  Tooltip,
  Icon,
  Popover,
} from 'choerodon-ui';
import { Modal, Table } from 'choerodon-ui/pro';
import _ from 'lodash';
import classnames from 'classnames';
import { StatusTag } from '@choerodon/components';
import StatusIcon from '../../../../../components/StatusIcon';
import ResourceListTitle from '../../components/resource-list-title';
import { useResourceStore } from '../../../stores';
import { useNetworkStore } from './stores';
import Modals from './modals';
import EditNetwork from './modals/network-operation';
import { useMainStore } from '../../stores';

import './index.less';

const { Column } = Table;
const modalKey = Modal.key();
const modalStyle = {
  width: 740,
};

const NetworkContent = observer(() => {
  const {
    prefixCls,
    intlPrefix,
    resourceStore: { getSelectedMenu: { parentId } },
    treeDs,
  } = useResourceStore();
  const {
    networkStore,
    mainStore: { openDeleteModal },
  } = useMainStore();
  const {
    networkDs,
    intl: { formatMessage },
  } = useNetworkStore();

  function refresh() {
    treeDs.query();
    networkDs.query();
  }

  function getEnvIsNotRunning() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord.get('connect');
    return !connect;
  }

  const renderName = ({ record }) => {
    const name = record.get('name');
    const status = record.get('status');
    const error = record.get('error');
    const instanceId = record.get('instanceId');
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
      }}
      >
        <StatusIcon
          name={name}
          status={status || ''}
          error={error || ''}
        />
        {instanceId && (
          <StatusTag
            style={{
              marginLeft: '5px',
            }}
            type="border"
            colorCode="operating"
            name="Chart资源"
          />
        )}
      </div>
    );
  };

  const renderTargetType = ({ record }) => {
    const {
      instances, selectors, targetAppServiceId, targetDeploymentName,
    } = record.get('target') || {};

    let type = 'EndPoints';
    if (targetAppServiceId) {
      type = formatMessage({ id: 'all_instance' });
    } else if (instances && instances.length) {
      type = formatMessage({ id: 'instance' });
    } else if (selectors) {
      type = formatMessage({ id: 'label' });
    } else if (targetDeploymentName) {
      type = formatMessage({ id: 'targetDeployment' });
    }

    return <span>{type}</span>;
  };

  const renderTarget = ({ record }) => {
    const {
      instances,
      selectors,
      endPoints,
      targetAppServiceName,
      targetAppServiceId,
      targetDeploymentName,
    } = record.get('target') || {};
    const node = [];
    const port = [];
    const len = endPoints ? 2 : 1;
    if (targetAppServiceId && targetAppServiceName) {
      node.push(
        <div className="net-target-item">
          <span>{targetAppServiceName}</span>
        </div>,
      );
    } else if (instances && instances.length) {
      _.forEach(instances, ({ id: itemId, code, status }) => {
        const targetClass = classnames({
          'net-target-item': true,
          'net-target-item-failed': status !== 'operating' && status !== 'running',
        });
        if (code) {
          node.push(
            <div className={targetClass} key={itemId}>
              <Tooltip
                title={formatMessage({ id: status || `${intlPrefix}.application.net.deleted` })}
                placement="top"
              >
                {code}
              </Tooltip>
            </div>,
          );
        }
      });
    }
    if (!_.isEmpty(selectors)) {
      _.forEach(selectors, (value, key) => node.push(
        <div className="net-target-item" key={key}>
          <span>{key}</span>
          =
          <span>{value}</span>
        </div>,
      ));
    }
    if (endPoints) {
      const targetIps = _.split(_.keys(endPoints)[0], ',');
      const portList = _.values(endPoints)[0];
      _.map(targetIps, (item, index) => node.push(
        <div className="net-target-item" key={index}>
          <span>{item}</span>
        </div>,
      ));
      _.map(portList, (item, index) => {
        port.push(
          <div className="net-target-item" key={index}>
            <span>{item.port}</span>
          </div>,
        );
      });
    }
    if (targetDeploymentName) {
      const targetClass = classnames({
        'net-target-item': true,
        'net-target-item-failed': record.get('status') !== 'operating' && record.get('status') !== 'running',
      });
      node.push(
        <div className={targetClass}>
          <Tooltip
            title={formatMessage({ id: record.get('status') || `${intlPrefix}.application.net.deleted` })}
            placement="top"
          >
            {targetDeploymentName}
          </Tooltip>
        </div>,
      );
    }
    return (
      <>
        {
          _.map([node, port], (item, index) => {
            if (item.length) {
              return (
                <div className="net-target-wrap" key={index}>
                  {item[0]}
                  {endPoints && (<div className="net-target-Ip">{item[1] || null}</div>)}
                  {item.length > len && (
                    <Popover
                      arrowPointAtCenter
                      placement="bottomRight"
                      content={<>{item}</>}
                      overlayClassName={`${prefixCls}-network-table`}
                    >
                      <Icon type="expand_more" className="net-expend-icon" />
                    </Popover>
                  )}
                </div>
              );
            }
            return '';
          })
        }
      </>
    );
  };

  const renderConfigType = ({ record }) => {
    const { externalIps, ports } = record.get('config') || {};
    const loadBalanceIp = record.get('loadBalanceIp');
    const type = record.get('type');
    const iPArr = [];
    const portArr = [];
    if (externalIps && externalIps.length) {
      _.forEach(externalIps, (item) => (
        iPArr.push(
          <div key={item} className="net-config-item">
            {item}
          </div>,
        )
      ));
    }
    if (ports && ports.length) {
      _.forEach(ports, ({ nodePort, port, targetPort }) => {
        portArr.push(
          <div key={port} className="net-config-item">
            {nodePort || (type !== 'ClusterIP' && formatMessage({ id: 'null' }))}
            {' '}
            {port}
            {' '}
            {targetPort}
          </div>,
        );
      });
    }

    let content = null;
    switch (type) {
      case 'ClusterIP':
        content = (
          <>
            <div className="net-config-wrap">
              <div className="net-type-title">
                <FormattedMessage id={`${intlPrefix}.application.net.ip`} />
              </div>
              <div>{externalIps ? iPArr : '-'}</div>
            </div>
            <div className="net-config-wrap">
              <div className="net-type-title">
                <FormattedMessage id={`${intlPrefix}.application.net.port`} />
              </div>
              <div>{portArr}</div>
            </div>
          </>
        );
        break;
      case 'NodePort':
        content = (
          <>
            <div className="net-config-item">
              <FormattedMessage id={`${intlPrefix}.application.net.nport`} />
            </div>
            <div>{portArr}</div>
          </>
        );
        break;
      case 'LoadBalancer':
        content = (
          <>
            <div className="net-config-wrap">
              <div className="net-type-title">
                <FormattedMessage id={`${intlPrefix}.application.net.nport`} />
              </div>
              <div>{portArr}</div>
            </div>
            {loadBalanceIp && (
              <div className="net-config-wrap">
                <div className="net-type-title">
                  <span>LoadBalancer IP</span>
                </div>
                <div>{loadBalanceIp}</div>
              </div>
            )}
          </>
        );
        break;
      default:
        break;
    }

    return (
      <div className="net-config-content">
        <span className="net-config-type">{type}</span>
        <Tooltip
          arrowPointAtCenter
          placement="bottomRight"
          title={content}
        >
          <Icon type="expand_more" className="net-expend-icon" />
        </Tooltip>
      </div>
    );
  };

  const renderAction = ({ record }) => {
    const status = record.get('status');
    const disabled = getEnvIsNotRunning() || status === 'operating';
    if (disabled || record.get('instanceId')) {
      return null;
    }
    const id = record.get('id');
    const name = record.get('name');
    const buttons = [
      {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.update-net'],
        text: formatMessage({ id: 'edit' }),
        action: openModal,
      },
      {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.delete-net'],
        text: formatMessage({ id: 'delete' }),
        action: () => openDeleteModal(parentId, id, name, 'service', refresh),
      },
    ];

    return (<Action data={buttons} />);
  };

  function openModal() {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: formatMessage({ id: 'network.header.update' }),
      children: <EditNetwork
        netId={networkDs.current.get('id')}
        envId={parentId}
        appServiceId={networkDs.current.get('appServiceId')}
        store={networkStore}
        refresh
      />,
      okText: formatMessage({ id: 'save' }),
      afterClose: () => networkStore.setSingleData([]),
    });
  }

  return (
    <div className={`${prefixCls}-network-table`}>
      <Modals />
      <ResourceListTitle type="services" />
      <Table
        dataSet={networkDs}
        border={false}
        queryBar="bar"
      >
        <Column name="name" renderer={renderName} sortable />
        <Column renderer={renderAction} width={60} />
        <Column renderer={renderTargetType} header={formatMessage({ id: `${intlPrefix}.application.net.targetType` })} width="1.2rem" />
        <Column renderer={renderTarget} header={formatMessage({ id: `${intlPrefix}.application.net.target` })} />
        <Column name="type" renderer={renderConfigType} width="1.5rem" />
      </Table>
    </div>
  );
});

export default NetworkContent;
