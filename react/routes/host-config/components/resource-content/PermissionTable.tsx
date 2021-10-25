import React, { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/master';
import { Table, Modal } from 'choerodon-ui/pro';
import { TimePopover, UserInfo } from '@choerodon/components';
import map from 'lodash/map';
import PermissionEditContent from '../permission-edit/index';
import { SMALL } from '@/utils/getModalWidth';
import { useHostConfigStore } from '@/routes/host-config/stores';
import { RecordObjectProps, Record, TableColumnTooltip } from '@/interface';

const { Column } = Table;

const modalKey = Modal.key();

const PermissionTable = () => {
  const {
    permissionDs,
    formatMessage,
    mainStore,
    refresh: allRefresh,
    projectId,
    prefixCls,
  } = useHostConfigStore();

  useEffect(() => {
    permissionDs.query();
  }, []);

  useEffect(() => {
    permissionDs.query();
  }, [mainStore.getSelectedHost?.id]);

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
    if (!res.refreshAll) {
      refresh();
    } else {
      allRefresh();
    }
  }, []);

  const handleEdit = useCallback(async (record: Record) => {
    Modal.open({
      key: modalKey,
      title: '修改权限',
      style: {
        width: SMALL,
      },
      drawer: true,
      okText: '保存',
      children: <PermissionEditContent
        record={record}
        refresh={refresh}
        mainStore={mainStore}
        projectId={projectId}
      />,
    });
  }, []);

  const renderAction = useCallback(({ record }: RecordObjectProps) => {
    if (record.get('gitlabProjectOwner') || record.get('creator')) {
      return null;
    }
    // if (record.get('creator')) {
    //   return null;
    // }
    const actionData = [
      {
        // service: ['choerodon.code.project.deploy.host.ps.permission.edit'],
        text: '修改',
        action: () => handleEdit(record),
      },
      {
        service: ['choerodon.code.project.deploy.host.ps.permission.delete'],
        text: formatMessage({ id: 'delete' }),
        action: () => handleDelete(record),
      },
    ];
    return (
      <Action data={actionData} />
    );
  }, []);

  const renderUserInfo = useCallback(({ value, record }) => {
    const imageUrl = record.get('imageUrl');
    return (
      <div className={`${prefixCls}-resource-user`}>
        <UserInfo
          className={`${prefixCls}-resource-username`}
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

  const renderPermissionLabel = useCallback(({ value }) => {
    const obj = {
      common: '主机使用权限',
      administrator: '主机管理权限',
    };
    // @ts-ignore
    return <span>{obj[value]}</span>;
  }, []);

  const renderDate = useCallback(({ value }) => (
    <TimePopover content={value} />
  ), []);

  return (
    <Table dataSet={permissionDs} className="c7ncd-tab-table">
      <Column name="realName" renderer={renderUserInfo} />
      <Column renderer={renderAction} width={60} />
      <Column name="loginName" tooltip={'overflow' as TableColumnTooltip} />
      <Column name="roles" renderer={renderRole} tooltip={'overflow' as TableColumnTooltip} />
      <Column name="permissionLabel" renderer={renderPermissionLabel} tooltip={'overflow' as TableColumnTooltip} />
      <Column name="creationDate" renderer={renderDate} width={100} />
    </Table>
  );
};

export default observer(PermissionTable);
