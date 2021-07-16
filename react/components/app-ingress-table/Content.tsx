/* eslint-disable max-len */
import React, { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Modal, Table } from 'choerodon-ui/pro';
import { TableQueryBarType } from '@/interface';
import { StatusTag, TimePopover, UserInfo } from '@choerodon/components';
import { useAppIngressTableStore } from './stores';
import HostConfigServices from './services';

import './index.less';

const { Column } = Table;
const modalKey = Modal.key();
const modalStyle = {
  width: 'calc(100vw - 3.52rem)',
};

const AppIngress = observer(() => {
  const {
    prefixCls,
    appIngressDataset,
    intl: { formatMessage },
    projectId,
  } = useAppIngressTableStore();

  function refresh() {
    appIngressDataset.query();
  }

  const openStopModal = useCallback(({ record: tableRecord }) => {
    Modal.open({
      key: Modal.key(),
      title: '停止镜像',
      children: `确定要停止镜像“${tableRecord.get('name')}”吗？`,
      okText: '停止',
      onOk: () => handleStop({ record: tableRecord }),
    });
  }, []);

  // 停止
  const handleStop = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.stopDocker(projectId, tableRecord.get('hostId'), tableRecord.get('id'));
    if (res) {
      refresh();
    }
    return res;
  }, []);

  // 重启
  const handleRestart = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.restartDocker(projectId, tableRecord.get('hostId'), tableRecord.get('id'));
    if (res) {
      refresh();
    }
    return res;
  }, []);

  const handleStart = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.startDocker(projectId, tableRecord.get('hostId'), tableRecord.get('id'));
    if (res) {
      refresh();
    }
    return res;
  }, []);

  const handleDelete = useCallback(({ record: tableRecord }) => {
    const modalProps = {
      title: '删除镜像',
      children: `确定删除镜像“${tableRecord.get('name')}”吗？`,
      okText: formatMessage({ id: 'delete' }),
    };
    appIngressDataset.delete(tableRecord, modalProps);
  }, []);

  const renderAction = useCallback(({ record: tableRecord }) => {
    if (!['running', 'exited'].includes(tableRecord.get('status'))) {
      return null;
    }
    const actionData = [{
      service: ['choerodon.code.project.deploy.host.ps.docker.delete'],
      text: formatMessage({ id: 'delete' }),
      action: () => handleDelete({ record: tableRecord }),
    }];
    if (tableRecord.get('status') === 'running') {
      actionData.unshift({
        service: ['choerodon.code.project.deploy.host.ps.docker.stop'],
        text: '停止',
        action: () => openStopModal({ record: tableRecord }),
      }, {
        service: ['choerodon.code.project.deploy.host.ps.docker.restart'],
        text: '重启',
        action: () => handleRestart({ record: tableRecord }),
      });
    } else {
      actionData.unshift({
        service: ['choerodon.code.project.deploy.host.ps.docker.start'],
        text: '启动',
        action: () => handleStart({ record: tableRecord }),
      });
    }
    return <Action data={actionData} />;
  }, [handleDelete, handleRestart, handleStart, openStopModal]);

  const renderName = ({ record, text }:any) => {
    const instanceType = record.get('instanceType');
    const isIntance = instanceType === 'normal_process';
    const tagName = isIntance ? '实例进程' : 'Docker';
    const tagColor = isIntance ? 'running' : 'success';
    return (
      <div className={`${prefixCls}-name`}>
        {text}
        <StatusTag colorCode={tagColor} name={tagName} type="border" />
      </div>
    );
  };

  const renderStatus = ({ record, text }:any) => (
    <StatusTag colorCode={text} name={text?.toUpperCase() || 'UNKNOWN'} />
  );

  const renderUser = ({ value }:any) => {
    const {
      ldap,
      realName,
      loginName,
      imageUrl,
      email,
    } = value || {};
    return <UserInfo realName={realName} loginName={ldap ? loginName : email} avatar={imageUrl} />;
  };

  return (
    <Table
      dataSet={appIngressDataset}
      border={false}
      queryBar={'bar' as TableQueryBarType}
      className="c7ncd-tab-table"
    >
      <Column name="name" renderer={renderName} />
      <Column renderer={renderAction} width={60} />
      <Column name="status" renderer={renderStatus} />
      <Column name="pid" width={100} />
      <Column name="ports" width={100} />
      <Column name="deployer" renderer={renderUser} />
      <Column name="creationDate" renderer={({ text }) => <TimePopover content={text} />} />
    </Table>
  );
});

export default AppIngress;
