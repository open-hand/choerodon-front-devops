/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-anonymous-default-export */
import { DataSet } from 'choerodon-ui/pro';

export default ({
  accountDs,
  formatMessage,
  intlPrefix,
  nodesTypeDs,
}) => {
  function handleUpdate({
    dataSet, record, name, value, oldValue,
  }) {
    if (name === 'type') {
      record.set('operator', null);
      record.set('expectValue', null);
    }
  }
  return {
    autoCreate: true,
    events: {
      update: handleUpdate,
    },
    fields: [
      {
        name: 'name',
        type: 'string',
        label: '节点名称',
        maxLength: 30,
        required: true,
      },
      {
        name: 'domain',
        type: 'string',
        label: '节点IP',
        required: true,
      },
      {
        name: 'port',
        type: 'string',
        label: '端口',
        required: true,
      },
      {
        name: 'authType',
        type: 'string',
        label: '账号配置',
        textField: 'text',
        valueField: 'value',
        required: true,
        defaultValue: 'accountPassword',
        options: accountDs,
      },
      {
        name: 'username',
        type: 'string',
        label: '用户名',
        required: true,
      },
      {
        name: 'password',
        type: 'string',
        dynamicProps: {
          required: ({ record }) => record.get('username'),
          label: ({ record }) => formatMessage({ id: record.get('authType') === 'accountPassword' ? 'password' : `${intlPrefix}.nodesCreate.token` }),
        },
      },
      {
        name: 'nodeType',
        type: 'string',
        label: '节点类型',
        textField: 'text',
        valueField: 'value',
        required: true,
        options: nodesTypeDs,
      },
    ],
  };
};
