import React, { useEffect } from 'react';
import { Modal, Table } from 'choerodon-ui/pro';
import { Action } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';
import TimePopover from '@/components/timePopover';
import { useClusterContentStore } from '../stores';

const { Column } = Table;

const EnvManageLists = observer(() => {
  const {
    intlPrefix,
    formatMessage,
    projectId,
    EnvMgListDs,
  } = useClusterContentStore();

  const renderTime = ({ text }) => text && <TimePopover content={text} />;

  const openQuataModal = () => {
    // Modal.open;
  };

  const renderOpts = () => {
    const actionData = [
      {
        service: [],
        text: formatMessage({ id: `${intlPrefix}.env.manage.resourceQuota` }),
        action: openQuataModal,
      },
    ];
    return (
      <Action data={actionData} />
    );
  };

  useEffect(() => {

  }, []);
  return (
    <Table
      dataSet={EnvMgListDs}
      border={false}
      queryBar="none"
    >
      <Column name="envDetail" />
      <Column renderer={renderOpts} />
      <Column name="projects" />
      <Column name="cpu" />
      <Column name="stack" />
      <Column name="createTime" renderer={renderTime} />
    </Table>
  );
});

export default EnvManageLists;
