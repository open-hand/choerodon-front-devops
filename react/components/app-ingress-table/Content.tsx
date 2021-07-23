/* eslint-disable max-len */
import React, { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Modal, Table, Tooltip } from 'choerodon-ui/pro';
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

  const handleDelete = useCallback(async ({ record: tableRecord }) => {
    const modalProps = {
      title: '删除镜像',
      children: `确定删除镜像“${tableRecord.get('name')}”吗？`,
      okText: formatMessage({ id: 'delete' }),
    };
    const res = await appIngressDataset.delete(tableRecord, modalProps);
    refresh();
  }, [appIngressDataset, refresh]);

  const renderAction = useCallback(({ record: tableRecord }) => {
    const status = tableRecord.get('status');

    const actionData = [{
      service: ['choerodon.code.project.deploy.host.ps.docker.delete'],
      text: formatMessage({ id: 'delete' }),
      action: () => handleDelete({ record: tableRecord }),
    }];

    if (!status) {
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
          // @ts-expect-error
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
          // @ts-expect-error
          action: () => handleStart({ record: tableRecord }),
        });
        break;
    }
    return <Action data={actionData} />;
  }, [handleDelete, handleRestart, handleStart, openStopModal]);

  const renderType = ({ record }:any) => {
    const instanceType = record.get('instanceType');

    const isIntance = instanceType === 'normal_process';
    const tagName = isIntance ? '实例进程' : 'Docker';
    const tagColor = isIntance ? 'running' : 'success';
    return <StatusTag colorCode={tagColor} name={tagName} type="border" />;
  };

  const renderName = ({ record, text }:any) => {
    const devopsHostCommandDTO = record.get('devopsHostCommandDTO');
    const operateStatus = devopsHostCommandDTO?.status;
    const error = devopsHostCommandDTO?.error;
    return (
      <>
        <Tooltip
          title={text}
        >
          <span className={`${prefixCls}-name`}>
            {text}
          </span>
        </Tooltip>
        {/* <Tooltip title={error}> */}
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
        {/* </Tooltip> */}
      </>
    );
  };

  const renderStatus = ({ record, text }:any) => (
    text ? <StatusTag colorCode={text} name={text?.toUpperCase() || 'UNKNOWN'} /> : ''
  );

  const renderUser = ({ value }:any) => {
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

  return (
    <Table
      dataSet={appIngressDataset}
      border={false}
      queryBar={'bar' as TableQueryBarType}
      className="c7ncd-tab-table"
    >
      <Column name="name" renderer={renderName} />
      <Column renderer={renderAction} width={55} />
      <Column name="instanceType" renderer={renderType} width={90} />
      <Column name="status" renderer={renderStatus} />
      <Column name="pid" width={80} />
      <Column name="ports" width={80} renderer={({ value }) => <Tooltip title={value}>{value}</Tooltip>} />
      <Column name="deployer" renderer={renderUser} />
      <Column name="creationDate" renderer={({ text }) => <TimePopover content={text} />} />
    </Table>
  );
});

export default AppIngress;
