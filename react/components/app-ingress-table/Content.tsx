/* eslint-disable max-len */
// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Modal, Table, Tooltip } from 'choerodon-ui/pro';
import { StatusTag, TimePopover, UserInfo } from '@choerodon/components';
import { TableQueryBarType } from '@/interface';
import { useAppIngressTableStore } from './stores';
import HostConfigServices from './services';

import './index.less';

const { Column } = Table;

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
      title: '停止应用实例',
      children: `确定要停止应用实例“${tableRecord.get('name')}”吗？`,
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

  const handleDelete = useCallback(async ({ record: tableRecord }) => {
    const modalProps = {
      title: '删除应用实例',
      children: `确定删除应用实例“${tableRecord.get('name')}”吗？`,
      okText: formatMessage({ id: 'delete' }),
    };
    try {
      const res = await appIngressDataset.delete(tableRecord, modalProps);
      if (res && res.failed) {
        message.error(res?.message);
      }
      refresh();
    } catch (error) {
      throw new Error(error);
    }
  }, [appIngressDataset, refresh]);

  const renderAction = useCallback(({ record: tableRecord }) => {
    const devopsHostCommandDTO = tableRecord.get('devopsHostCommandDTO');
    const operateStatus = devopsHostCommandDTO?.status;

    if (operateStatus === 'operating') {
      return null;
    }

    const status = tableRecord.get('status');

    const actionData = [{
      service: ['choerodon.code.project.deploy.host.ps.docker.delete'],
      text: formatMessage({ id: 'delete' }),
      action: () => handleDelete({ record: tableRecord }),
    }];

    if (!status || (['normal_process', 'java_process'].includes(tableRecord.get('instanceType')))) {
      return <Action data={actionData} />;
    }

    if (!['running', 'exited', 'removed'].includes(status)) {
      return null;
    }

    switch (status) {
      case 'running':
        actionData.unshift({
          service: ['choerodon.code.project.deploy.host.ps.docker.stop'],
          text: '停止',
          action: () => openStopModal({ record: tableRecord }),
        }, {
          service: ['choerodon.code.project.deploy.host.ps.docker.restart'],
          text: '重启',
          action: () => handleRestart({ record: tableRecord }),
        });
        break;
      case 'removed':
        break;
      default:
        actionData.unshift({
          service: ['choerodon.code.project.deploy.host.ps.docker.start'],
          text: '启动',
          action: () => handleStart({ record: tableRecord }),
        });
        break;
    }
    return <Action data={actionData} />;
  }, [handleDelete, handleRestart, handleStart, openStopModal]);

  const renderName = ({ record, text }: any) => {
    const devopsHostCommandDTO = record.get('devopsHostCommandDTO');
    const operateStatus = devopsHostCommandDTO?.status;
    const error = devopsHostCommandDTO?.error;
    const commandType = devopsHostCommandDTO?.commandType;
    return (
      <>
        <Tooltip
          title={`[${commandType}]:${error}`}
        >
          <span className={`${prefixCls}-name`}>
            {text}
          </span>
        </Tooltip>
        {operateStatus && !(operateStatus === 'success') && (
          <StatusTag
            style={{
              marginLeft: '5px',
            }}
            ellipsisTitle={error}
            colorCode={operateStatus}
            name={operateStatus === 'operating' ? '执行中' : '失败'}
          />
        )}
      </>
    );
  };

  const renderStatus = ({ text }: any) => (
    text ? <StatusTag colorCode={text} name={text?.toUpperCase() || 'UNKNOWN'} /> : ''
  );

  const renderUser = ({ value }: any) => {
    if (!value) {
      return null;
    }
    const {
      ldap,
      realName,
      loginName,
      imageUrl,
      email,
    } = value || {};
    return <UserInfo realName={realName} loginName={ldap ? loginName : email} avatar={imageUrl} />;
  };

  // 主机管理应用实例
  return (
    <Table
      dataSet={appIngressDataset}
      border={false}
      queryBar={'bar' as TableQueryBarType}
      className="c7ncd-tab-table"
    >
      <Column name="name" renderer={renderName} />
      <Column renderer={renderAction} width={55} />
      <Column name="code" width={90} />
      <Column name="status" renderer={renderStatus} />
      <Column name="pid" width={80} />
      <Column name="ports" width={100} renderer={({ value }) => <Tooltip title={value}>{value}</Tooltip>} />
      <Column name="creator" renderer={renderUser} />
      <Column name="creationDate" renderer={({ text }) => <TimePopover content={text} />} />
    </Table>
  );
});

export default AppIngress;
