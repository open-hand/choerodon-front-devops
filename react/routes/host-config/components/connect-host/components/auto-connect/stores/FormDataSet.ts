import { DataSet } from 'choerodon-ui/pro';
import HostConfigApis from '@/routes/host-config/apis/DeployApis';
import omit from 'lodash/omit';
import { RecordObjectProps, DataSetProps, FieldType } from '@/interface';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
  accountDs: DataSet,
  hostId: string,
}

function handleUpdate({ name, record }: { name: string, record: any }) {
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

  return ({
    autoCreate: true,
    selection: false,
    autoQueryAfterSubmit: false,
    paging: false,
    transport: {
      submit: ({ data: [data] }) => {
        const postData = omit(data, ['__status', '__id']);
        return ({
          url: HostConfigApis.hostConnect(projectId, hostId),
          method: 'post',
          data: postData,
        });
      },
    },
    // @ts-ignore
    fields: [
      {
        name: 'hostIp',
        type: 'string' as FieldType,
        // @ts-ignore
        validator: checkIP,
        required: true,
        label: formatMessage({ id: `${intlPrefix}.ip.external` }),
      },
      {
        name: 'sshPort',
        validator: checkPort,
        label: formatMessage({ id: `${intlPrefix}.port.external` }),
        required: true,
      },
      {
        name: 'username',
        type: 'string' as FieldType,
        label: formatMessage({ id: 'boot.username' }),
        required: true,

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
    ],
    events: {
      update: handleUpdate,
    },
  });
};
