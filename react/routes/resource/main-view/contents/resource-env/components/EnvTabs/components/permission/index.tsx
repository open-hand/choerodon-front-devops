/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Action } from '@choerodon/master';
import { Table, Tooltip } from 'choerodon-ui/pro';
import map from 'lodash/map';
import { TimePopover } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { useREStore } from '../../../../stores';
import { useResourceStore } from '@/routes/resource/stores';
import { TableQueryBarType } from '@/interface';

const { Column } = Table;
const Permissions = () => {
  const {
    intlPrefix,
    formatMessage,
  } = useResourceStore();

  const {
    permissionsDs: tableDs,
    baseInfoDs,
  } = useREStore();

  function handleDelete() {
    const record = tableDs.current;
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.permission.delete.title` }),
      children: formatMessage({ id: `${intlPrefix}.permission.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
    };
    tableDs.delete(record, modalProps);
  }

  function renderActions({ record }: any) {
    const actionData = [
      {
        service: [],
        text: formatMessage({ id: 'delete' }),
        action: handleDelete,
      },
    ];
    const isOwner = !record.get('gitlabProjectOwner');
    return isOwner && <Action data={actionData} />;
  }

  function renderDate({ value }: any) {
    return value && <TimePopover content={value} />;
  }

  function renderRole({ value }: any) {
    const roles = map(value || [], 'name');
    return (
      <Tooltip title={roles.join()}>
        {roles.join()}
      </Tooltip>
    );
  }

  function getActionColumn() {
    const envRecord = baseInfoDs.current;
    if (!envRecord) return null;
    const isSkip = envRecord.get('skipCheckPermission');
    return !isSkip && <Column renderer={renderActions} />;
  }

  return (
    <div className="c7ncd-tab-table">
      <Table
        dataSet={tableDs}
        border={false}
        queryBar={'bar' as TableQueryBarType}
        pristine
      >
        <Column name="realName" sortable />
        {getActionColumn()}
        <Column name="loginName" sortable />
        <Column name="roles" renderer={renderRole} />
        <Column name="creationDate" renderer={renderDate} sortable />
      </Table>
    </div>
  );
};

export default observer(Permissions);
