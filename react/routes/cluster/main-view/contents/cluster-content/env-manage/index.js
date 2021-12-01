import React, { useEffect } from 'react';
import { Modal, Table } from 'choerodon-ui/pro';
import { Action } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import TimePopover from '@/components/timePopover';
import { useClusterContentStore } from '../stores';
import EnvForm from './EnvForm';
import './index.less';

const { Column } = Table;

const EnvManageLists = observer(() => {
  const {
    intlPrefix,
    formatMessage,
    projectId,
    EnvMgListDs,
    EnvQuotaFormDs,
  } = useClusterContentStore();

  const renderTime = ({ text }) => text && <TimePopover content={text} />;

  const openQuataModal = () => {
    Modal.open({
      title: formatMessage({ id: `${intlPrefix}.env.manage.resourceQuota.title` }),
      drawer: true,
      style: {
        width: '3.8rem',
      },
      className: 'c7ncd-cluster-envQuota-modal',
      children: <EnvForm
        EnvQuotaFormDs={EnvQuotaFormDs}
        projectId={projectId}
        intlPrefix={intlPrefix}
      />,
      okText: formatMessage({ id: 'boot.save' }),
    });
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
