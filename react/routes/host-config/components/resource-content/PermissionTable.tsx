/* eslint-disable import/order */
import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/master';
import { useHostConfigStore } from '@/routes/host-config/stores';
import { Table } from 'choerodon-ui/pro';
import { RecordObjectProps, Record, TableColumnTooltip } from '@/interface';
import { TimePopover, UserInfo } from '@choerodon/components';
import map from 'lodash/map';

const { Column } = Table;

const PermissionTable = () => {
  const {
    permissionDs,
    formatMessage,
    intlPrefix,
    mainStore,
    prefixCls,
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
    if (record.get('gitlabProjectOwner') || record.get('creator')) {
      return null;
    }
    const actionData = [{
      service: ['choerodon.code.project.deploy.host.ps.permission.delete'],
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
      <div className={`${prefixCls}-resource-user`}>
        <UserInfo
          realName={value}
          avatar={imageUrl}
        />
        {record.get('creator') && (
          <span className={`${prefixCls}-resource-creator`}>
            {formatMessage({ id: 'creator' })}
          </span>
        )}
      </div>
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
      {!mainStore.getSelectedHost?.skipCheckPermission && (
        <Column renderer={renderAction} width={60} />
      )}
      <Column name="loginName" tooltip={'overflow' as TableColumnTooltip} />
      <Column name="roles" renderer={renderRole} />
      <Column name="creationDate" renderer={renderDate} width={100} />
    </Table>
  );
};

export default observer(PermissionTable);
