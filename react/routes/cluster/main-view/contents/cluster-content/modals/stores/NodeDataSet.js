/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-anonymous-default-export */
import { DataSet } from 'choerodon-ui/pro';

function nameValidator(dataSet) {
  dataSet.forEach((eachRecord) => eachRecord.getField('name').checkValidity());
}

function ipValidator(dataSet) {
  dataSet.forEach((eachRecord) => eachRecord.getField('hostIp').checkValidity());
}

function handleRemove({ dataSet }) {
  nameValidator(dataSet);
  ipValidator(dataSet);
}

// 校验是否有重复的名字
function checkoutHasParamName(value, name, record) {
  const ds = record.dataSet;
  const hasRepeatName = ds.some((tempRecord) => {
    const headerName = tempRecord.get('name');
    const recordName = record.get('name');
    const isEqual = headerName && recordName && headerName === recordName;
    return tempRecord.id !== record.id && isEqual;
  });
  if (hasRepeatName) {
    // record.getField('value').set('disabled', true);
    return '存在重复节点名称';
  }
  // record.getField('value').set('disabled', false);
  return true;
}

function checkoutHasSameIP(value, name, record) {
  const ds = record.dataSet;
  const hasRepeatIP = ds.some((tempRecord) => {
    const headerName = tempRecord.get('hostIp');
    const recordName = record.get('hostIp');
    const isEqual = headerName && recordName && headerName === recordName;
    return tempRecord.id !== record.id && isEqual;
  });
  if (hasRepeatIP) {
    // record.getField('value').set('disabled', true);
    return '存在重复的节点IP';
  }
  // record.getField('value').set('disabled', false);
  return true;
}

export default ({
  accountDs,
  formatMessage,
  intlPrefix,
  isModal,
}) => {
  async function handleUpdate({
    dataSet, record, name, value, oldValue,
  }) {
    if (!isModal && name === 'type') {
      if (value?.includes('etcd') && !value?.includes('master')) {
        record.set('type', ['etcd', 'worker']);
      }
      if (oldValue?.length === 2 && oldValue?.includes('master') && oldValue?.includes('etcd') && !value?.includes('master')) {
        record.set('type', ['etcd', 'worker']);
      }
    }
    if (name === 'name') {
      nameValidator(dataSet);
    }
    if (name === 'hostIp') {
      ipValidator(dataSet);
    }
    if (record.get('hasError')) {
      const res = await record.validate();
      if (res) {
        record.set('hasError', false);
      }
    }
  }
  return {
    autoCreate: true,
    events: {
      update: handleUpdate,
      remove: handleRemove,
    },
    fields: [
      {
        name: 'name',
        type: 'string',
        label: '节点名称',
        maxLength: 30,
        required: true,
        validator: checkoutHasParamName,
      },
      {
        name: 'hostIp',
        type: 'string',
        label: '节点IP',
        required: true,
        validator: checkoutHasSameIP,
      },
      {
        name: 'sshPort',
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
        required: true,
        dynamicProps: {
          label: ({ record }) => formatMessage({ id: record.get('authType') === 'accountPassword' ? 'password' : `${intlPrefix}.nodesCreate.token` }),
        },
      },
      {
        name: 'type',
        type: 'string',
        label: '节点类型',
        textField: 'text',
        valueField: 'value',
        required: true,
      },
    ],
  };
};
