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

export default ({
  accountDs,
  formatMessage,
  intlPrefix,
  modalStore,
  isSingle,
}) => {
  async function checkPort(value, name, record) {
    if (value && record.getPristineValue(name)
      && String(value) === String(record.getPristineValue(name))
    ) {
      return true;
    }
    const p = /^([1-9]\d*|0)$/;
    const data = {
      typeMsg: '',
      min: 1,
      max: 65535,
      failedMsg: `${intlPrefix}.port.check.failed`,
    };

    if (value) {
      if (
        p.test(value)
        && parseInt(value, 10) >= data.min
        && parseInt(value, 10) <= data.max
      ) {
        return true;
      }
      return formatMessage({ id: data.failedMsg });
    }
    return true;
  }

  function checkoutHasSameIP(value, name, record) {
    const p = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
    if (value && !p.test(value)) {
      return formatMessage({ id: 'network.ip.check.failed' });
    }
    // return true;
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

  async function handleUpdate({
    dataSet, record, name, value, oldValue,
  }) {
    // 新建的时候是多选框，有这个节点校验规则，但是独立添加node的弹窗就是单选就跳过这个规则
    if (!isSingle && name === 'role') {
      if (value?.includes('etcd') && !value?.includes('master')) {
        record.set('role', ['etcd', 'worker']);
      }
      if (oldValue?.length === 2 && oldValue?.includes('master') && oldValue?.includes('etcd') && !value?.includes('master')) {
        record.set('role', ['etcd', 'worker']);
      }
    }
    if (name === 'name') {
      nameValidator(dataSet);
    }
    if (name === 'hostIp') {
      ipValidator(dataSet);
    }
    // 当已经有错误的时候，更新值重新校验并且去除hasError字段以及清空错误消息
    if (record.get('hasError')) {
      const res = await record.validate();
      if (res) {
        record.set('hasError', false);
        modalStore.setModalErrorMes(null);
      }
    }
    // 单独校验当修改了测试连接需要的相关数据的时候会去校验这条record的status，并且重新置为空需要重新进行测试
    const tempArr = ['hostIp', 'sshPort', 'authType', 'username', 'password'];
    if (tempArr.includes(name) && record.get('status')) {
      record.set('status', null);
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
        defaultValue: '节点1',
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
        validator: checkPort,
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
        name: 'role',
        type: 'string',
        label: '节点类型',
        textField: 'text',
        valueField: 'value',
        required: !isSingle,
        ignore: isSingle ? 'always' : 'never',
      },
      {
        name: 'status',
        type: 'string',
        validator: (value, name, record) => {
          if (!record.get('status')) {
            record.set('status', 'wait');
            return false;
          }
          if (record.get('status') !== 'success') {
            return false;
          }
          return true;
        },
      },
    ],
  };
};
