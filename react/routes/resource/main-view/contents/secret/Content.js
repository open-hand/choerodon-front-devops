import React, { useMemo, useState, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { Action, useFormatMessage } from '@choerodon/master';
import { Modal, Table } from 'choerodon-ui/pro';
import { keys } from 'lodash';
import KeyValueModal from '@/components/key-value';
import MouserOverWrapper from '../../../../../components/MouseOverWrapper/MouserOverWrapper';
import TimePopover from '../../../../../components/timePopover/TimePopover';
import { useResourceStore } from '../../../stores';
import { useKeyValueStore } from './stores';
import Modals from './modals';
import { useMainStore } from '../../stores';
import ResourceListTitle from '../../components/resource-list-title';
import StatusIcon from '../../../../../components/StatusIcon';

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
    resourceStore: { getSelectedMenu: { parentId } },
    treeDs,
  } = useResourceStore();

  const format = useFormatMessage('c7ncd.resource');

  const {
    intl: { formatMessage },
    permissions,
    formStore,
    SecretTableDs,
  } = useKeyValueStore();
  const { deletionStore: { openDeleteModal } } = useMainStore();

  function refresh() {
    treeDs.query();
    SecretTableDs.query();
  }

  function getEnvIsNotRunning() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord.get('connect');
    return !connect;
  }

  function renderName({ value, record }) {
    const commandStatus = record.get('commandStatus');
    const disabled = getEnvIsNotRunning() || commandStatus === 'operating';
    const error = record.get('error');

    return (
      <div className={`${prefixCls}-keyValue-name`}>
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

  function renderDate({ value }) {
    return <TimePopover content={value} />;
  }

  function renderAction({ record }) {
    const commandStatus = record.get('commandStatus');
    const disabled = getEnvIsNotRunning() || commandStatus === 'operating';
    if (disabled) {
      return null;
    }
    const id = record.get('id');
    const name = record.get('name');
    const buttons = [
      {
        service: permissions.edit,
        text: formatMessage({ id: 'boot.edit' }),
        action: openModal,
      },
      {
        service: permissions.delete,
        text: formatMessage({ id: 'delete' }),
        action: () => openDeleteModal({
          envId: parentId, instanceId: id, instanceName: name, type: 'secret', callback: refresh,
        }),
      },
    ];
    return <Action data={buttons} />;
  }

  function openModal() {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.cipher.edit` }),
      children: <KeyValueModal
        title="cipher"
        id={SecretTableDs.current.get('id')}
        envId={parentId}
        intlPrefix={intlPrefix}
        refresh={refresh}
      />,
      okText: formatMessage({ id: 'boot.save' }),
    });
  }

  return (
    <div className={`${prefixCls}-keyValue-table`}>
      <Modals />
      <ResourceListTitle type="secrets" />
      <Table
        dataSet={SecretTableDs}
        border={false}
        queryBar="bar"
      >
        <Column name="name" sortable header={format({ id: 'secrets' })} renderer={renderName} />
        <Column renderer={renderAction} width={60} />
        <Column name="value" renderer={renderValue} header={formatMessage({ id: 'key' })} />
        <Column name="lastUpdateDate" sortable renderer={renderDate} width={105} />
      </Table>
    </div>
  );
});

export default ConfigMap;
