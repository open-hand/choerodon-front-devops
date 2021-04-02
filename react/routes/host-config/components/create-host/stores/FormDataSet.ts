/* eslint-disable import/no-anonymous-default-export */
import { DataSet } from 'choerodon-ui/pro';
import HostConfigApis from '@/routes/host-config/apis';
import omit from 'lodash/omit';
import { RecordObjectProps, DataSetProps, FieldType } from '@/interface';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
  typeDs: DataSet,
  accountDs: DataSet,
  hostId: string,
  showTestTab: boolean,
  hostType: string,
}

function setStatus(record: any, isDefault: boolean = false) {
  if (record) {
    const hostStatus = record.get('hostStatus');
    const jmeterStatus = record.get('jmeterStatus');
    const status = record.get('status');
    if ((status && status !== 'wait') || isDefault) {
      // eslint-disable-next-line no-nested-ternary
      const newStatus = [hostStatus, jmeterStatus].includes('failed') ? 'failed' : hostStatus === 'success' && jmeterStatus === 'success' ? 'success' : 'operating';
      record.init('status', record.get('type') === 'deploy' ? hostStatus : newStatus);
    }
  }
}

function handleLoad({ dataSet, hostType }: { dataSet: DataSet, hostType: string }) {
  if (dataSet.current) {
    dataSet.current.init('type', hostType);
  }
  setStatus(dataSet.current, true);
}

function handleUpdate({ name, record }: { name: string, record: any }) {
  if (name === 'hostIp') {
    record.get('sshPort') && record.getField('sshPort').checkValidity();
    if (record.get('type') === 'distribute_test' && record.get('jmeterPort')) {
      record.getField('jmeterPort').checkValidity();
    }
  }
  if (name === 'type') {
    setStatus(record);
  }

  if (name === 'authType') {
    record.get('password') && record.set('password', null);
  }
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
  typeDs,
  accountDs,
  hostId,
  showTestTab,
  hostType,
}: FormProps): DataSetProps => {
  async function checkName(value: any, name: any, record: any) {
    if (value && record.getPristineValue(name) && value === record.getPristineValue(name)) {
      return true;
    }
    if (value && value === record.getPristineValue(name)) {
      return true;
    }
    if (value) {
      try {
        const res = await HostConfigApis.checkName(projectId, value, record.get('type'));
        if ((res && res.failed) || !res) {
          return formatMessage({ id: 'checkNameExist' });
        }
        return true;
      } catch (err) {
        return formatMessage({ id: 'checkNameFail' });
      }
    }
    return true;
  }

  async function checkPortUnique(ip: string, port: any, type: string, currentHostType: string) {
    try {
      const control = type === 'sshPort' ? HostConfigApis.checkSshPort : HostConfigApis.checkJmeterPort;
      const res = await control(projectId, ip, port, currentHostType);
      return res;
    } catch (e) {
      return false;
    }
  }

  function checkIP(value: any) {
    const p = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
    if (value && !p.test(value)) {
      return formatMessage({ id: 'network.ip.check.failed' });
    }
    return true;
  }

  async function checkPort(value: any, name: any, record: any) {
    if (value && record.getPristineValue(name)
      && String(value) === String(record.getPristineValue(name))
      && record.get('hostIp') && record.getPristineValue('hostIp')
      && record.get('hostIp') === record.getPristineValue('hostIp')
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
        if (record.get('hostIp')) {
          if (await checkPortUnique(record.get('hostIp'), value, name, record.get('type')) === false) {
            return formatMessage({ id: `${intlPrefix}.port.unique.failed.${name}` });
          }
        }
        return true;
      }
      return formatMessage({ id: data.failedMsg });
    }
    return true;
  }

  function checkPrivatePort(value: any, name: any, record: any) {
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

    if (value && (!p.test(value) || parseInt(value, 10) < data.min
      || parseInt(value, 10) > data.max)) {
      return formatMessage({ id: data.failedMsg });
    }
    return true;
  }

  return ({
    autoCreate: false,
    selection: false,
    autoQueryAfterSubmit: false,
    paging: false,
    transport: {
      read: {
        url: HostConfigApis.getHostDetail(projectId, hostId, hostType),
        method: 'get',
      },
      create: ({ data: [data] }) => {
        const postData = omit(data, ['__status', '__id', 'status', 'jmeterStatus', 'hostStatus']);
        return ({
          url: HostConfigApis.createHost(projectId, data.type),
          method: 'post',
          data: postData,
        });
      },
      update: ({ data: [data] }) => {
        const postData = omit(data, ['__status', '__id', 'status', 'jmeterStatus', 'hostStatus']);
        return ({
          url: HostConfigApis.editHost(projectId, hostId, data.type),
          method: 'put',
          data: postData,
        });
      },
    },
    // @ts-ignore
    fields: [
      {
        name: 'type',
        type: 'string' as FieldType,
        textField: 'text',
        valueField: 'value',
        defaultValue: showTestTab ? 'distribute_test' : 'deploy',
        options: typeDs,
        label: formatMessage({ id: `${intlPrefix}.type` }),
      },
      {
        name: 'name',
        type: 'string' as FieldType,
        maxLength: 15,
        required: true,
        validator: checkName,
        label: '主机名称',
      },
      {
        name: 'hostIp',
        type: 'string' as FieldType,
        required: true,
        // @ts-ignore
        validator: checkIP,
        label: 'IP',
      },
      {
        name: 'sshPort',
        required: true,
        validator: checkPort,
        label: formatMessage({ id: `${intlPrefix}.port` }),
      },
      {
        name: 'username',
        type: 'string' as FieldType,
        required: true,
        label: formatMessage({ id: 'userName' }),
      },
      {
        name: 'password',
        type: 'string' as FieldType,
        required: true,
        dynamicProps: {
          label: ({ record }: RecordObjectProps) => formatMessage({ id: record.get('authType') === 'accountPassword' ? 'password' : `${intlPrefix}.token` }),
        },
      },
      {
        name: 'authType',
        type: 'string' as FieldType,
        textField: 'text',
        valueField: 'value',
        required: true,
        defaultValue: 'accountPassword',
        options: accountDs,
      },
      {
        name: 'jmeterPort',
        type: 'string' as FieldType,
        dynamicProps: {
          required: ({ record }: RecordObjectProps) => record.get('type') === 'distribute_test',
          validator: ({ record }: RecordObjectProps) => record.get('type') === 'distribute_test' && checkPort,
        },
        label: formatMessage({ id: `${intlPrefix}.jmeter.port` }),
      },
      {
        name: 'jmeterPath',
        type: 'string' as FieldType,
        pattern: /^(\/[\w\W]+)+$/,
        dynamicProps: {
          required: ({ record }: RecordObjectProps) => record.get('type') === 'distribute_test',
        },
        label: formatMessage({ id: `${intlPrefix}.jmeter.path` }),
      },
      {
        name: 'privateIp',
        type: 'string' as FieldType,
        label: formatMessage({ id: `${intlPrefix}.ip.private` }),
        dynamicProps: {
          required: ({ record }: RecordObjectProps) => record.get('type') === 'deploy'
            && record.get('privatePort'),
          validator: ({ record }: RecordObjectProps) => record.get('type') === 'deploy' && checkIP,
        },
      },
      {
        name: 'privatePort',
        label: formatMessage({ id: `${intlPrefix}.port.private` }),
        dynamicProps: {
          required: ({ record }: RecordObjectProps) => record.get('type') === 'deploy'
            && record.get('privateIp'),
          validator: ({ record }: RecordObjectProps) => record.get('type') === 'deploy' && checkPrivatePort,
        },
      },
    ],
    events: {
      load: (loadProps: { dataSet: DataSet }) => handleLoad({ ...loadProps, hostType }),
      update: handleUpdate,
    },
  });
};
