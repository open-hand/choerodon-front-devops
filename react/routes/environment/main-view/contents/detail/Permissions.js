import React from 'react';
import { Action } from '@choerodon/boot';
import { Table } from 'choerodon-ui/pro';
import map from 'lodash/map';
import TimePopover from '../../../../../components/time-popover';
import { useEnvironmentStore } from '../../../stores';
import { useDetailStore } from './stores';
import { isNotRunning } from '../../../util';

const { Column } = Table;

export default function Permissions() {
  const {
    envStore: { getSelectedMenu },
  } = useEnvironmentStore();
  const {
    intl: { formatMessage },
    permissionsDs: tableDs,
    intlPrefix,
  } = useDetailStore();

  function handleDelete() {
    const record = tableDs.current;
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.permission.delete.title` }),
      children: formatMessage({ id: `${intlPrefix}.permission.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
    };
    tableDs.delete(record, modalProps);
  }

  function renderActions({ record }) {
    const { skipCheckPermission } = getSelectedMenu;
    const isOwner = record.get('gitlabProjectOwner');
    const actionData = [
      {
        service: [],
        text: formatMessage({ id: 'delete' }),
        action: handleDelete,
      },
    ];
    const displayAction = !isOwner && !skipCheckPermission;
    return displayAction ? <Action data={actionData} /> : null;
  }

  function renderDate({ value }) {
    return value ? <TimePopover datetime={value} /> : null;
  }

  function renderRole({ value }) {
    const roles = map(value || [], 'name');
    return roles.join();
  }

  function getActionColumn() {
    const disabled = isNotRunning(getSelectedMenu);
    return !disabled && <Column renderer={renderActions} />;
  }

  return (<div className="c7ncd-tab-table">
    <Table
      dataSet={tableDs}
      border={false}
      queryBar="bar"
      pristine
    >
      <Column name="realName" sortable />
      {getActionColumn()}
      <Column name="loginName" sortable />
      <Column name="roles" renderer={renderRole} />
      <Column name="creationDate" renderer={renderDate} sortable />
    </Table>
  </div>);
}
