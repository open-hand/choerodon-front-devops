import React from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Table, Modal } from 'choerodon-ui/pro';
import { TimePopover } from '@choerodon/components';
import { TableQueryBarType } from '@/interface';
import { HeaderButtons } from '@choerodon/master';
import KeyValueModal from '@/components/key-value';
import MouserOverWrapper from '../../../../../components/MouseOverWrapper/MouserOverWrapper';
import StatusIcon from '../../../../../components/StatusIcon';
import { useConfigMapStore } from './stores';

import './index.less';

const { Column } = Table;

const modalKey = Modal.key();

const modalStyle = {
  width: 'calc(100vw - 3.52rem)',
};

const ConfigMap = observer((props) => {
  const {
    intl: { formatMessage },
    permissions,
    formStore,
    prefixCls,
    subPrefixCls,
    intlPrefix,
    ConfigMapTableDs,
    connect,
    envId,
    deleteModals,
    openDeleteModal,
  } = useConfigMapStore();

  function refresh() {
    ConfigMapTableDs.query();
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

  function renderKey({ value = [], record }:any) {
    return (
      <MouserOverWrapper width={0.5}>
        {value.join(',')}
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
        action: () => openDeleteModal(envId, id, name, 'configMap', refresh),
      },
    ];
    return <Action data={buttons} />;
  }

  function openModal(id?:number) {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: id ? formatMessage({ id: `${intlPrefix}.edit.configMap` }) : formatMessage({ id: `${intlPrefix}.create.configMap` }),
      children: <KeyValueModal
        id={id}
        modeSwitch
        title="mapping"
        envId={envId}
        store={formStore}
        intlPrefix={intlPrefix}
        refresh={refresh}
      />,
      okText: id ? formatMessage({ id: 'save' }) : formatMessage({ id: 'create' }),
    });
  }

  const renderBtnsItems = () => [{
    permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.configmap'],
    name: formatMessage({ id: `${intlPrefix}.create.configMap` }),
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
        dataSet={ConfigMapTableDs}
        queryBar={'bar' as TableQueryBarType}
        className="c7ncd-tab-table"
      >
        <Column name="name" sortable header={formatMessage({ id: `${intlPrefix}.configMap` })} renderer={renderName} />
        <Column renderer={renderAction} width={60} />
        <Column name="key" renderer={renderKey} />
        <Column name="lastUpdateDate" sortable renderer={renderDate} width={105} />
      </Table>
      {deleteModals}
    </>
  );
});

export default ConfigMap;
