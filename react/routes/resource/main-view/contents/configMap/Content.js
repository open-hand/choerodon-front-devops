import React from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Table, Modal } from 'choerodon-ui/pro';
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
  const {
    intl: { formatMessage },
    permissions,
    formStore,
    ConfigMapTableDs,
  } = useKeyValueStore();
  const { mainStore: { openDeleteModal } } = useMainStore();

  function refresh() {
    treeDs.query();
    ConfigMapTableDs.query();
  }

  function getEnvIsNotRunning() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord.get('connect');
    return !connect;
  }

  function renderName({ value, record }) {
    const commandStatus = record.get('commandStatus');
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

  function renderKey({ value = [], record }) {
    return (
      <MouserOverWrapper width={0.5}>
        {value.join(',')}
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
        text: formatMessage({ id: 'edit' }),
        action: openModal,
      },
      {
        service: permissions.delete,
        text: formatMessage({ id: 'delete' }),
        action: () => openDeleteModal(parentId, id, name, 'configMap', refresh),
      },
    ];
    return <Action data={buttons} />;
  }

  function openModal() {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.configMap.edit` }),
      children: <KeyValueModal
        modeSwitch
        title="mapping"
        id={ConfigMapTableDs.current.get('id')}
        envId={parentId}
        store={formStore}
        intlPrefix={intlPrefix}
        refresh={refresh}
      />,
      okText: formatMessage({ id: 'save' }),
    });
  }

  return (
    <div className={`${prefixCls}-keyValue-table`}>
      <Modals />
      <ResourceListTitle type="configMaps" />
      <Table
        dataSet={ConfigMapTableDs}
        border={false}
        queryBar="bar"
      >
        <Column name="name" sortable header={formatMessage({ id: `${intlPrefix}.configMap` })} renderer={renderName} />
        <Column renderer={renderAction} width={60} />
        <Column name="key" renderer={renderKey} />
        <Column name="lastUpdateDate" sortable renderer={renderDate} width={105} />
      </Table>
    </div>
  );
});

export default ConfigMap;
