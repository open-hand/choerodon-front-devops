/* eslint-disable max-len */
import React, { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Modal, Table } from 'choerodon-ui/pro';
import { TableQueryBarType } from '@/interface';
import { HeaderButtons } from '@choerodon/master';
import { StatusTag, TimePopover } from '@choerodon/components';
import { useAppIngressTableStore } from './stores';

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
  } = useAppIngressTableStore();

  const renderBtnsItems = () => {

  };

  // 打开删除弹窗
  function openDeleteModal({ record }:any) {
    Modal.open({
      key: Modal.key(),
      title: '删除镜像',
      children: `确定要删除镜像“${record.get('name')}”吗？`,
      okText: '删除',
      onOk: () => handleDelete({ record }),
    });
  }

  // 删除
  async function handleDelete({ record }:any) {
    try {
      const res = await appIngressDataset.delete(record);
    } catch (error) {
      throw new Error(error);
    }
  }

  // 启动
  function handleStart() {

  }

  // 打开停止弹窗
  function openStopModal({ name }:{name:string}) {
    Modal.open({
      key: Modal.key(),
      title: '停用镜像',
      children: `确定要停止镜像“${name}”吗？`,
      okText: '停止',
      onOk: handleStop,
    });
  }

  // 停止
  function handleStop() {

  }

  // 重启
  function handleRestart() {

  }

  const renderAction = ({ record }:any) => {
    const actionsDefault = [
      {
        service: [],
        text: '删除',
        action: () => openDeleteModal({ record }),
      },
    ];
    const actionsRuning = [
      {
        service: [],
        text: '停止',
        action: () => openStopModal({ name: record.get('name') }),
      },
      {
        service: [],
        text: '重启',
        action: handleRestart,
      },
    ];
    const actionsExited = [
      {
        service: [],
        text: '启动',
        action: handleStart,
      },
    ];

    return <Action data={[...actionsExited, ...actionsRuning, ...actionsDefault]} />;
  };

  const renderName = ({ record, text }:any) => (
    <div className={`${prefixCls}-name`}>
      {text}
      <StatusTag colorCode="success" name="Docker" type="border" />
    </div>
  );

  const renderStatus = ({ record, text }:any) => (
    <StatusTag colorCode="stop" name="EXITED" />
  );

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
      <Column name="progressPort" />
      <Column name="port" />
      <Column name="deployer" />
      <Column name="date" renderer={({ text }) => <TimePopover content={text} />} />
    </Table>
  );
});

export default AppIngress;
