/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-anonymous-default-export */
import { DataSet } from 'choerodon-ui/pro';
import { difference, without } from 'lodash';

function ipValidator(dataSet) {
  dataSet.forEach((eachRecord) => eachRecord.getField('hostIp').checkValidity());
}

export default ({
  accountDs,
  formatMessage,
  intlPrefix,
  createHostClusterStore,
}) => {
  function hasAllCheckedFields(record, fieldName) {
    const tempArr = ['hostIp', 'hostPort', 'username', 'password'];
    const omitArr = without(tempArr, fieldName);
    return omitArr.some((item) => record.get(item));
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
    const p = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
    if (value && !p.test(value)) {
      return formatMessage({ id: 'network.ip.check.failed' });
    }
    return true;
  }

  async function handleUpdate({
    dataSet, record, name, value, oldValue,
  }) {
    if (name && value) {
      record.set('type', 'outter');
    }
    if (name === 'hostIp') {
      ipValidator(dataSet);
    }
    const reConnectFields = ['hostIp', 'hostPort', 'authType', 'username', 'password'];
    if (reConnectFields.includes(name) && value !== oldValue) {
      record.set('status', null);
    }
  }
  return {
    autoCreate: true,
    events: {
      update: handleUpdate,
    },
    fields: [
      {
        name: 'isInnerNode',
        type: 'boolean',
        label: '是否同时作为集群节点',
        ignore: 'always',
      },
      {
        name: 'innerNodeName',
        type: 'string',
        label: '集群节点',
        dynamicProps: {
          required: ({ record }) => record.get('isInnerNode') && hasAllCheckedFields(record),
          ignore: ({ record }) => (record.get('isInnerNode') ? 'never' : 'always'),
        },
      },
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
        defaultValue: 'accountPassword',
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
      {
        name: 'status',
        type: 'string',
        validator: (value, name, record) => {
          // 当填了公网节点的值的时候就应该去检测这个公网节点测通了没
          if (hasAllCheckedFields(record)) {
            if (!value) {
              record.set('status', 'wait');
              return false;
            }
            if (value === 'success') {
              return true;
            }
            return false;
          }
          return true;
        },
      },
    ],
  };
};
