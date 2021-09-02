import React, { useMemo, useState, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Modal, Table } from 'choerodon-ui/pro';
import { keys } from 'lodash';
import { TableQueryBarType } from '@/interface';
import { HeaderButtons } from '@choerodon/master';
import { TimePopover } from '@choerodon/components';
import MouserOverWrapper from '@/components/MouseOverWrapper/MouserOverWrapper';
// import { useResourceStore } from '../../../stores';
import StatusIcon from '@/components/StatusIcon';
import KeyValueModal from '@/components/key-value';
import { useSecretsStore } from './stores';
// import { useMainStore } from '../../stores';

import './index.less';

const { Column } = Table;
const modalKey = Modal.key();
const modalStyle = {
  width: 'calc(100vw - 3.52rem)',
};

const ConfigMap = observer((props) => {
  const {
    prefixCls,
    intlPrefix,
    envId,
    connect,
    permissions,
    formatMessage,
    SecretTableDs,
    formStore,
    openDeleteModal,
    deleteModals,
  } = useSecretsStore();

  function refresh() {
    SecretTableDs.query();
  }

  function renderName({ value, record }:any) {
    const commandStatus = record.get('commandStatus');
    const error = record.get('error');

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
      }}
      >
        <StatusIcon
          width={0.4}
          name={value}
          status={commandStatus || ''}
          error={error || ''}
        />
      </div>
    );
  }

  function renderValue({ value = [] }) {
    const keyArr = keys(value);
    return (
      <MouserOverWrapper width={0.5}>
        {keyArr && keyArr.join(',')}
      </MouserOverWrapper>
    );
  }

  function renderDate({ value }:any) {
    return <TimePopover content={value} />;
  }

  function renderAction({ record }:any) {
    const commandStatus = record.get('commandStatus');
    const disabled = !connect || commandStatus === 'operating';
    if (disabled) {
      return null;
    }
    const id = record.get('id');
    const name = record.get('name');
    const buttons = [
      {
        service: permissions.edit,
        text: formatMessage({ id: 'edit' }),
        action: () => openModal(id),
      },
      {
        service: permissions.delete,
        text: formatMessage({ id: 'delete' }),
        action: () => openDeleteModal(envId, id, name, 'secret', refresh),
      },
    ];
    return <Action data={buttons} />;
  }

  function openModal(id?:number) {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: id ? formatMessage({ id: `${intlPrefix}.cipher.edit` }) : formatMessage({ id: `${intlPrefix}.cipher.create` }),
      children: <KeyValueModal
        title="cipher"
        id={id}
        envId={envId}
        intlPrefix={intlPrefix}
        refresh={refresh}
      />,
      okText: id ? formatMessage({ id: 'save' }) : formatMessage({ id: 'create' }),
    });
  }

  const renderBtnsItems = () => [{
    permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.cipher'],
    name: formatMessage({ id: `${intlPrefix}.cipher.create` }),
    icon: 'playlist_add',
    handler: () => openModal(),
    display: true,
    service: permissions,
    disabled: !connect,
  }, {
    icon: 'refresh',
    handler: refresh,
    display: true,
  }];

  return (
    <>
      <HeaderButtons
        className={`${prefixCls}-detail-headerButton`}
        items={renderBtnsItems()}
        showClassName
      />
      <Table
        dataSet={SecretTableDs}
        border={false}
        queryBar={'bar' as TableQueryBarType}
        className="c7ncd-tab-table"
      >
        <Column name="name" sortable header={formatMessage({ id: `${intlPrefix}.cipher` })} renderer={renderName} />
        <Column renderer={renderAction} width={60} />
        <Column name="value" renderer={renderValue} header={formatMessage({ id: 'key' })} />
        <Column name="lastUpdateDate" sortable renderer={renderDate} width={105} />
      </Table>
      {deleteModals}
    </>
  );
});

export default ConfigMap;
