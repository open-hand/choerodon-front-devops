import { DataSetProps, FieldProps } from '@/interface';
import { ingressApi } from '@/api/Ingress';

function handleCreate({ dataSet }: any) {
  const hasNameRecord = dataSet.find((record: any) => record.get('serviceName'));
  dataSet.forEach((record: any) => {
    hasNameRecord && record.init('serviceName', hasNameRecord.get('serviceName'));
    hasNameRecord && record.init('ports', hasNameRecord.get('ports'));
    record.getField('path').checkValidity();
  });
}

async function handleUpdate({
  value, name, record, dataSet,
}: any) {
  if (name === 'path' && value) {
    dataSet.forEach((eachRecord: any) => {
      if (record.id !== eachRecord.id) {
        eachRecord.getField('path').checkValidity();
      }
    });
  }
}

export default (): DataSetProps => {
  async function checkPath(value: string, name: string, record: any) {
    if (!record.cascadeParent) {
      return;
    }
    const envId = record.cascadeParent.cascadeParent.get('environmentId');
    const p = /^\/(\S)*$/;
    const domain = record.cascadeParent.get('domain');
    if (!domain) return;
    if (!value) {
      // eslint-disable-next-line consistent-return
      return '如不设置，请填写 /';
    }
    if (p.test(value)) {
      const { dataSet } = record;
      const repeatRecord = dataSet.find((pathRecord: any) => pathRecord.id !== record.id && pathRecord.get('path') === value);
      if (repeatRecord) {
        // eslint-disable-next-line consistent-return
        return '域名地址与路径的组合已经存在';
      }
      try {
        const res = await ingressApi.checkDomain(domain, envId, value, '');
        if (res && !res.failed) {
          // eslint-disable-next-line consistent-return
          return true;
        }
        // eslint-disable-next-line consistent-return
        return '域名地址与路径的组合已经存在';
      } catch (e) {
        // eslint-disable-next-line consistent-return
        return '以 / 开始，且不能有空白字符';
      }
    } else {
      // eslint-disable-next-line consistent-return
      return '以 / 开始，且不能有空白字符';
    }
  }

  function isRequired({ dataSet, record }: any) {
    const parentRecord = record.cascadeParent;
    const hasValue = parentRecord.get('name') || parentRecord.get('domain') || parentRecord.get('certId');
    const dirty = dataSet.some((pathRecord: any) => pathRecord.dirty);
    return dirty || !!hasValue;
  }

  return ({
    autoCreate: true,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'path',
        type: 'string',
        defaultValue: '/',
        label: '路径',
        validator: checkPath,
        maxLength: 30,
      },
      {
        name: 'serviceName',
        type: 'string',
        label: '网络',
        dynamicProps: {
          required: isRequired,
        },
      },
      {
        name: 'servicePort',
        type: 'number',
        label: '端口',
        dynamicProps: {
          required: isRequired,
        },
      },
      {
        name: 'ports',
        type: 'object',
        ignore: 'always',
      },
    ] as FieldProps[],
    events: {
      create: handleCreate,
      update: handleUpdate,
      remove: handleCreate,
    },
  });
};
