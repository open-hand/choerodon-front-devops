/* eslint-disable max-len */
import React, { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import { Modal, Table } from 'choerodon-ui/pro';
import { TableQueryBarType } from '@/interface';
import { HeaderButtons } from '@choerodon/master';
import { StatusTag } from '@choerodon/components';
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
        action: () => handleDelete({ record }),
      },
    ];
    const actionsRuning = [
      {
        service: [],
        text: '停止',
        action: handleStop,
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

    return <Action data={[...actionsDefault, ...actionsExited, ...actionsRuning]} />;
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
    <>
      <HeaderButtons
        className={`${prefixCls}-detail-headerButton`}
        items={renderBtnsItems()}
        showClassName
      />
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
        <Column name="date" />
      </Table>
    </>
  );
});

export default AppIngress;
