import { DataSet } from 'choerodon-ui/pro';
import HostConfigApis from '@/routes/host-config/apis/TestApis';
import omit from 'lodash/omit';
import { RecordObjectProps, DataSetProps, FieldType } from '@/interface';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
  accountDs: DataSet,
  hostId: string,
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

function handleLoad({ dataSet }: { dataSet: DataSet }) {
  setStatus(dataSet.current, true);
}

function handleUpdate({ name, record }: { name: string, record: any }) {
  if (name === 'hostIp') {
    record.get('sshPort') && record.getField('sshPort').checkValidity();
    if (record.get('jmeterPort')) {
      record.getField('jmeterPort').checkValidity();
    }
  }

  if (name === 'authType') {
    record.get('password') && record.set('password', null);
  }
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
  accountDs,
  hostId,
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
        const res = await HostConfigApis.checkName(projectId, value);
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

  async function checkPortUnique(ip: string, port: any, type: string) {
    try {
      const control = type === 'sshPort' ? HostConfigApis.checkSshPort : HostConfigApis.checkJmeterPort;
      const res = await control(projectId, ip, port);
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
          if (await checkPortUnique(record.get('hostIp'), value, name) === false) {
            return formatMessage({ id: `${intlPrefix}.port.unique.failed.${name}` });
          }
        }
        return true;
      }
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
        url: HostConfigApis.getHostDetail(projectId, hostId),
        method: 'get',
      },
      create: ({ data: [data] }) => {
        const postData = omit(data, ['__status', '__id', 'status', 'jmeterStatus', 'hostStatus']);
        return ({
          url: HostConfigApis.createHost(projectId),
          method: 'post',
          data: postData,
        });
      },
      update: ({ data: [data] }) => {
        const postData = omit(data, ['__status', '__id', 'status', 'jmeterStatus', 'hostStatus']);
        return ({
          url: HostConfigApis.editHost(projectId, hostId),
          method: 'put',
          data: postData,
        });
      },
    },
    // @ts-ignore
    fields: [
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
        // @ts-ignore
        validator: checkIP,
        required: true,
        label: formatMessage({ id: `${intlPrefix}.ip.distribute_test` }),
      },
      {
        name: 'sshPort',
        validator: checkPort,
        label: formatMessage({ id: `${intlPrefix}.port` }),
        required: true,
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
        label: formatMessage({ id: `${intlPrefix}.account` }),
      },
      {
        name: 'jmeterPort',
        type: 'string' as FieldType,
        validator: checkPort,
        required: true,
        label: formatMessage({ id: `${intlPrefix}.jmeter.port` }),
      },
      {
        name: 'jmeterPath',
        type: 'string' as FieldType,
        pattern: /^(\/[\w\W]+)+$/,
        required: true,
        label: formatMessage({ id: `${intlPrefix}.jmeter.path` }),
      },
    ],
    events: {
      load: (loadProps: { dataSet: DataSet }) => handleLoad({ ...loadProps }),
      update: handleUpdate,
    },
  });
};
