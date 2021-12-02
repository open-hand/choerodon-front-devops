/* eslint-disable */
import React, { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Action, useFormatMessage } from '@choerodon/master';
import { Modal, Table, Icon } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import map from 'lodash/map';
import { StatusTag } from '@choerodon/components';
import StatusIcon from '../../../../../components/StatusIcon';
import { useResourceStore } from '../../../stores';
import { useIngressStore } from './stores';
import Modals from './modals';
import MouserOverWrapper from '../../../../../components/MouseOverWrapper';
import DomainForm from '../../components/domain-form';
import { useMainStore } from '../../stores';
import ResourceListTitle from '../../components/resource-list-title';

import './index.less';

const modalKey = Modal.key();
const modalStyle = {
  width: 740,
};

const { Column } = Table;

const IngressContent = observer(() => {
  const {
    prefixCls,
    intlPrefix,
    resourceStore: { getSelectedMenu: { parentId } },
    treeDs,
  } = useResourceStore();

  const format = useFormatMessage('c7ncd.resource');

  const {
    ingressDs,
    intl: { formatMessage },
  } = useIngressStore();
  const {
    ingressStore,
    deletionStore: { openDeleteModal },
  } = useMainStore();

  function refresh() {
    treeDs.query();
    ingressDs.query();
  }

  function getEnvIsNotRunning() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord.get('connect');
    return !connect;
  }

  function renderName({ record }) {
    const name = record.get('name');
    const status = record.get('status');
    const error = record.get('error');
    const disabled = getEnvIsNotRunning() || status === 'operating';
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
  }

  function renderDomain({ value }) {
    return <MouserOverWrapper text={value} width={0.18}>{value}</MouserOverWrapper>;
  }

  function renderPath({ value }) {
    return (
      map(value, ({ path }) => (
        <div key={path} className={`${prefixCls}-ingress-path`}>
          <MouserOverWrapper text={path} width={0.1}>
            <span>{path}</span>
          </MouserOverWrapper>
        </div>
      ))
    );
  }

  function renderService({ record }) {
    return (
      map(record.get('pathList'), ({
        serviceStatus, serviceName, serviceError, serviceId,
      }) => (
        <div
          className="c7n-network-service"
          key={serviceId}
        >
          <MouserOverWrapper
            text={serviceName}
            width={0.1}
            className="c7n-status-text"
          >
            <span className={serviceStatus === 'deleted' ? 'c7n-status-deleted' : ''}>{serviceName}</span>
          </MouserOverWrapper>
          {(serviceStatus === 'deleted' || serviceStatus === 'failed') && (
          <Tooltip title={serviceError ? `failed: ${serviceError}` : formatMessage({ id: serviceStatus })}>
            <Icon type="error" className="c7n-status-failed" />
          </Tooltip>
          )}
        </div>
      ))
    );
  }

  function renderAction({ record }) {
    const status = record.get('status');
    const disabled = getEnvIsNotRunning() || status === 'operating';
    if (disabled || record.get('instanceId')) {
      return null;
    }
    const id = record.get('id');
    const name = record.get('name');
    const buttons = [
      {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.update.domain'],
        text: format({ id: 'Modify' }),
        action: openModal,
      },
      {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.delete-domain'],
        text: formatMessage({ id: 'delete' }),
        action: () => openDeleteModal({
          envId: parentId, instanceId: id, instanceName: name, type: 'ingress', callback: refresh,
        }),
      },
    ];

    return (<Action data={buttons} />);
  }

  function openModal() {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: formatMessage({ id: 'domain.update.head' }),
      children: <DomainForm
        envId={parentId}
        ingressId={ingressDs.current.get('id')}
        refresh={refresh}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
      />,
      okText: formatMessage({ id: 'boot.save' }),
    });
  }

  return (
    <div className={`${prefixCls}-ingress-table`}>
      <Modals />
      <ResourceListTitle type="ingresses" />
      <Table
        dataSet={ingressDs}
        border={false}
        queryBar="bar"
        rowHeight="auto"
      >
        <Column name="name" renderer={renderName} sortable />
        <Column renderer={renderAction} width={60} />
        <Column name="domain" renderer={renderDomain} />
        <Column name="pathList" renderer={renderPath} />
        <Column renderer={renderService} header={format({ id: 'serviceCount' })} />
      </Table>
    </div>
  );
});

export default IngressContent;
