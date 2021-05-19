import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Modal, Table } from 'choerodon-ui/pro';
import keys from 'lodash/keys';
import MouserOverWrapper from '../../../../../../components/MouseOverWrapper/MouserOverWrapper';
import TimePopover from '../../../../../../components/timePopover/TimePopover';
import KeyValueModal from '../modals/key-value/KeyValueProIndex';
import { useResourceStore } from '../../../../stores';
import { useApplicationStore } from '../stores';
import { useMainStore } from '../../../stores';

import '../configs/index.less';
import StatusIcon from '../../../../../../components/StatusIcon';

const { Column } = Table;
const modalKey = Modal.key();
const modalStyle = {
  width: 'calc(100vw - 3.52rem)',
};

const Cipher = observer(() => {
  const {
    intl: { formatMessage },
    prefixCls,
    intlPrefix,
    resourceStore: { getSelectedMenu: { id, parentId } },
    treeDs,
  } = useResourceStore();
  const {
    cipherStore,
    cipherDs,
    tabs: {
      CIPHER_TAB,
    },
  } = useApplicationStore();
  const { mainStore: { openDeleteModal } } = useMainStore();
  const statusStyle = useMemo(() => ({ marginRight: '0.08rem' }), []);

  function refresh() {
    treeDs.query();
    return cipherDs.query();
  }

  function getEnvIsNotRunning() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord.get('connect');
    return !connect;
  }

  function handleEdit(record) {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.cipher.edit` }),
      children: <KeyValueModal
        intlPrefix={intlPrefix}
        title={CIPHER_TAB}
        id={record.get('id')}
        envId={parentId}
        appId={id}
        store={cipherStore}
        refresh={refresh}
      />,
      okText: formatMessage({ id: 'save' }),
    });
  }

  function renderName({ value, record }) {
    const commandStatus = record.get('commandStatus');
    const error = record.get('error');
    const disabled = getEnvIsNotRunning() || commandStatus === 'operating';
    return (
      <div className={`${prefixCls}-keyValue-name`}>
        <StatusIcon
          width={0.4}
          name={value}
          clickAble={!disabled}
          onClick={handleEdit}
          status={commandStatus || ''}
          error={error || ''}
          record={record}
          permissionCode={['choerodon.code.project.deploy.app-deployment.resource.ps.edit-cipher']}
        />
      </div>
    );
  }

  function renderKey({ value = [], record }) {
    return (
      <MouserOverWrapper width={0.5}>
        {keys(record.get('value') || {}).join(',')}
      </MouserOverWrapper>
    );
  }

  function renderDate({ value }) {
    return <TimePopover content={value} />;
  }

  function renderAction({ record }) {
    const commandStatus = record.get('commandStatus');
    const secretId = record.get('id');
    const name = record.get('name');
    const disabled = getEnvIsNotRunning() || commandStatus === 'operating';
    if (disabled) {
      return null;
    }
    const buttons = [
      {
        service: ['choerodon.code.project.deploy.app-deployment.resource.ps.delete-cipher'],
        text: formatMessage({ id: 'delete' }),
        action: () => openDeleteModal(parentId, secretId, name, 'secret', refresh),
      },
    ];
    return <Action data={buttons} />;
  }

  return (
    <div className={`${prefixCls}-mapping-content`}>
      <div className="c7ncd-tab-table">
        <Table
          dataSet={cipherDs}
          border={false}
          queryBar="bar"
        >
          <Column sortable name="name" header={formatMessage({ id: `${intlPrefix}.application.tabs.cipher` })} renderer={renderName} />
          <Column renderer={renderAction} width="0.7rem" />
          <Column name="key" renderer={renderKey} />
          <Column sortable name="lastUpdateDate" renderer={renderDate} width="1rem" />
        </Table>
      </div>
    </div>
  );
});

export default Cipher;
