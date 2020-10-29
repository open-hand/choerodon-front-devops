/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-anonymous-default-export */
import { DataSet } from 'choerodon-ui/pro';

function ipValidator(dataSet) {
  dataSet.forEach((eachRecord) => eachRecord.getField('hostIp').checkValidity());
}

export default ({
  accountDs,
  formatMessage,
  intlPrefix,
  isModal,
  modalStore,
  clusterId,
  projectId,
}) => {
  function hasAllCheckedFields(record) {
    const hasIp = record.get('hostIp');
    const hasPort = record.get('hostPort');
    const hasAccountType = record.get('authType');
    const hasUsername = record.get('username');
    const hasPassword = record.get('password');
    return hasIp || hasPort || hasAccountType || hasUsername || hasPassword;
  }
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
    // const ds = record.dataSet;
    // const hasRepeatIP = ds.some((tempRecord) => {
    //   const headerName = tempRecord.get('hostIp');
    //   const recordName = record.get('hostIp');
    //   const isEqual = headerName && recordName && headerName === recordName;
    //   return tempRecord.id !== record.id && isEqual;
    // });
    // if (hasRepeatIP) {
    //   // record.getField('value').set('disabled', true);
    //   return '存在重复的节点IP';
    // }
    // record.getField('value').set('disabled', false);
    return true;
  }

  async function handleUpdate({
    dataSet, record, name, value, oldValue,
  }) {
    if (name) {
      record.set('type', 'outter');
    }
    if (name === 'hostIp') {
      ipValidator(dataSet);
    }
    // 当已经有错误的时候，更新值重新校验并且去除hasError字段以及清空错误消息
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
    },
    fields: [
      {
        name: 'hostIp',
        type: 'string',
        label: '公网IP',
        dynamicProps: {
          required: ({ record }) => hasAllCheckedFields(record),
        },
        validator: checkoutHasSameIP,
      },
      {
        name: 'hostPort',
        type: 'string',
        label: '公网SSH端口',
        dynamicProps: {
          required: ({ record }) => hasAllCheckedFields(record),
        },
        validator: checkPort,
      },
      {
        name: 'authType',
        type: 'string',
        label: '账号配置',
        textField: 'text',
        valueField: 'value',
        dynamicProps: {
          required: ({ record }) => hasAllCheckedFields(record),
        },
        options: accountDs,
      },
      {
        name: 'username',
        type: 'string',
        label: '用户名',
        dynamicProps: {
          required: ({ record }) => hasAllCheckedFields(record),
        },
      },
      {
        name: 'password',
        type: 'string',
        dynamicProps: {
          required: ({ record }) => hasAllCheckedFields(record),
          label: ({ record }) => formatMessage({ id: record.get('authType') === 'accountPassword' ? 'password' : `${intlPrefix}.nodesCreate.token` }),
        },
      },
      {
        name: 'type',
        type: 'string',
        dynamicProps: {
          defaultValue: ({ record }) => (hasAllCheckedFields(record) ? 'outter' : null),
        },
      },
    ],
  };
};
