import { DataSet } from 'choerodon-ui/pro';
import HostConfigApis from '@/routes/host-config/apis/DeployApis';
import omit from 'lodash/omit';
import { RecordObjectProps, DataSetProps, FieldType } from '@/interface';
import HostConfigServices from '@/routes/host-config/services';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
  accountDs: DataSet,
  hostId: string,
}

function handleUpdate({ name, record }: { name: string, record: any }) {
  if (name === 'hostIp') {
    record.get('sshPort') && record.getField('sshPort').checkValidity();
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

  async function checkPortUnique(ip: string, port: any) {
    try {
      const res = await HostConfigServices.checkSshPort(projectId, ip, port);
      if (res?.failed) {
        return false;
      }
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
          if (await checkPortUnique(record.get('hostIp'), value) === false) {
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
        const postData = omit(data, ['__status', '__id']);
        return ({
          url: HostConfigApis.createHost(projectId),
          method: 'post',
          data: postData,
          // transformResponse: ((res) => {
          //   try {
          //     const result = JSON.parse(res);
          //     return result;
          //   } catch (e) {
          //     return { data: res };
          //   }
          // }),
        });
      },
      update: ({ data: [data] }) => {
        const postData = omit(data, ['__status', '__id']);
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
        maxLength: 30,
        required: true,
        validator: checkName,
        label: formatMessage({ id: `${intlPrefix}.name` }),
      },
      {
        name: 'hostIp',
        type: 'string' as FieldType,
        // @ts-ignore
        validator: checkIP,
        label: formatMessage({ id: `${intlPrefix}.ip.private` }),
      },
      {
        name: 'sshPort',
        validator: checkPort,
        label: formatMessage({ id: `${intlPrefix}.port.private` }),
      },
      {
        name: 'username',
        type: 'string' as FieldType,
        label: formatMessage({ id: 'userName' }),
        dynamicProps: {
          required: ({ record }: RecordObjectProps) => (record.get('hostIp') && record.get('sshPort')) || record.get('password'),
        },
      },
      {
        name: 'password',
        type: 'string' as FieldType,
        dynamicProps: {
          label: ({ record }: RecordObjectProps) => formatMessage({ id: record.get('authType') === 'accountPassword' ? 'password' : `${intlPrefix}.token` }),
          required: ({ record }: RecordObjectProps) => (record.get('hostIp') && record.get('sshPort')) || record.get('username'),
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
    ],
    events: {
      update: handleUpdate,
    },
  });
};
