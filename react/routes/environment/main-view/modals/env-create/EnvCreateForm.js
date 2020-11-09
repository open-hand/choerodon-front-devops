/* eslint-disable */
import React, { Fragment } from 'react';
import {
  Form, TextField, TextArea, Select,
} from 'choerodon-ui/pro';
import StatusDot from '../../../../../components/status-dot';
import { useFormStore } from './stores';
import Tips from '../../../../../components/new-tips';

import './index.less';

function ClusterItem({ text, connect }) {
  return (
    <>
      {text && (
      <StatusDot
        active
        synchronize
        size="inner"
        connect={connect}
      />
      )}
      {' '}
      {text}
    </>
  );
}

export default function EnvCreateForm({ intlPrefix, modal, refresh }) {
  const {
    formDs,
    clusterOptionDs,
    intl: { formatMessage },
  } = useFormStore();

  function getStatus(record) {
    const tempStatus = record.get('status');
    switch (tempStatus) {
      case 'running':
        return ['running', 'connect'];
      case 'failed':
        return ['failed', 'failed'];
      case 'operating':
        return ['operating', 'operating'];
      default:
        break;
    }
    return ['disconnect', 'disconnect'];
  }

  function ClusterItem({ record }) {
    const [status, text] = getStatus(record);
    return (
      <>
        {text && (
        <StatusDot
          active
          synchronize
          size="inner"
          getStatus={() => getStatus(record)}
        />
        )}
        {' '}
        {record.get('name')}
      </>
    );
  }

  async function handleCreate() {
    try {
      if ((await formDs.submit()) !== false) {
        refresh();
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  modal.handleOk(handleCreate);

  function clusterRenderer({ record, text }) {
    const current = clusterOptionDs.find((item) => item.get('id') === record.get('clusterId'));
    if (current) {
      return <ClusterItem record={current} />;
    }
    return text;
  }

  function getClusterOption({ record, text }) {
    return <ClusterItem record={record} />;
  }

  function getGroupOption({ text }) {
    return text;
  }

  return (
    <div className="c7ncd-env-form-wrap">
      <Form dataSet={formDs}>
        <Select
          searchable
          name="clusterId"
          renderer={clusterRenderer}
          optionRenderer={getClusterOption}
          clearButton={false}
          addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.cluster.tips` })} />}
        />
        <TextField
          name="code"
          addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.code.tips` })} />}
        />
        <TextField
          name="name"
          addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.name.tips` })} />}
        />
        <TextArea name="description" resize="vertical" />
        <Select
          searchable
          name="devopsEnvGroupId"
          optionRenderer={getGroupOption}
          renderer={getGroupOption}
          addonAfter={<Tips helpText={formatMessage({ id: `${intlPrefix}.group.tips` })} />}
        />
      </Form>
    </div>
  );
}
