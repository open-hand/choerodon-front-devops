/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
/* eslint-disable */
import React, { Fragment, useState } from 'react';
import { Action } from '@choerodon/master';
import { Table } from 'choerodon-ui/pro';
import StatusTags from '../../../../../../components/status-tag';
import TimePopover from '../../../../../../components/timePopover';
import { useNodeContentStore } from '../stores';
import LogSiderbar from '../../../../../../components/log-siderbar';
import { useClusterStore } from '../../../../stores';

import './index.less';

const { Column } = Table;

const NodePodsTable = () => {
  const {
    formatMessage,
    nodePodsDs,
  } = useNodeContentStore();
  const {
    clusterStore: {
      getSelectedMenu: {
        parentId,
      },
    },
  } = useClusterStore();
  const [visible, setVisible] = useState(false);
  const [recordData, setRecordData] = useState();
  const renderStatus = ({ record }) => {
    const status = record.get('status');
    const name = record.get('name');
    return (
      <>
        <StatusTags name={status} colorCode={status} />
        <span>{name}</span>
      </>
    );
  };

  const renderCreationDate = ({ record }) => {
    const creationDate = record.get('creationDate');
    return <TimePopover content={creationDate} />;
  };

  function openLog(record) {
    setRecordData(record.toData());
    setVisible(true);
  }

  function closeLog() {
    setVisible(false);
  }

  function renderActions({ record }) {
    const actionData = [
      {
        service: [],
        text: formatMessage({ id: 'c7ncd-clusterManagement.PodLog' }),
        action: () => openLog(record),
      },
    ];
    return (<Action data={actionData} />);
  }

  return (
    <>
      <Table
        dataSet={nodePodsDs}
        border={false}
        queryBar="none"
        className="c7ncd-node-pods-table"
      >
        <Column header={formatMessage({ id: 'c7ncd-clusterManagement.Status' })} renderer={renderStatus} />
        <Column renderer={renderActions} />
        <Column header={formatMessage({ id: 'c7ncd-clusterManagement.CreationTime' })} renderer={renderCreationDate} />
      </Table>
      {visible && (
      <LogSiderbar
        visible={visible}
        onClose={closeLog}
        record={recordData}
        clusterId={parentId}
      />
      )}
    </>
  );
};

export default NodePodsTable;
