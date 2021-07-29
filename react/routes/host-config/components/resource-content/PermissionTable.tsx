import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/master';
import { useHostConfigStore } from '@/routes/host-config/stores';
import { Table } from 'choerodon-ui/pro';
import { RecordObjectProps, Record } from '@/interface';
import { TimePopover, UserInfo } from '@choerodon/components';
import map from 'lodash/map';

const { Column } = Table;

const PermissionTable = () => {
  const {
    permissionDs,
    formatMessage,
    intlPrefix,
  } = useHostConfigStore();

  const refresh = useCallback(() => {
    permissionDs.query();
  }, []);

  const handleDelete = useCallback(async (record: Record) => {
    const modalProps = {
      title: formatMessage({ id: 'permission_delete' }),
      children: formatMessage({ id: 'permission_delete_des' }),
      okText: formatMessage({ id: 'delete' }),
    };
    const res = await permissionDs.delete(record, modalProps);
    if (res && res.success) {
      refresh();
    }
  }, []);

  const renderAction = useCallback(({ record }: RecordObjectProps) => {
    const actionData = [{
      service: [''],
      text: formatMessage({ id: 'delete' }),
      action: () => handleDelete(record),
    }];
    return (
      <Action data={actionData} />
    );
  }, []);

  const renderUserInfo = useCallback(({ value, record }) => {
    const imageUrl = record.get('imageUrl');
    return (
      <UserInfo
        realName={value}
        avatar={imageUrl}
      />
    );
  }, []);

  const renderRole = useCallback(({ value }) => {
    const roles = map(value || [], 'name');
    return roles.join();
  }, []);

  const renderDate = useCallback(({ value }) => (
    <TimePopover content={value} />
  ), []);

  return (
    <Table dataSet={permissionDs} className="c7ncd-tab-table">
      <Column name="realName" renderer={renderUserInfo} />
      <Column renderer={renderAction} width={60} />
      <Column name="loginName" />
      <Column name="roles" renderer={renderRole} />
      <Column name="creationDate" renderer={renderDate} />
    </Table>
  );
};

export default observer(PermissionTable);
