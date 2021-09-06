import { axios } from '@choerodon/boot';
import { Record } from '@/interface';
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable max-len */

function handleCreate({ dataSet }:any) {
  const hasNameRecord = dataSet.find((record:Record) => record.get('serviceName'));
  dataSet.forEach((record:Record) => {
    hasNameRecord && record.init('serviceName', hasNameRecord.get('serviceName'));
    hasNameRecord && record.init('ports', hasNameRecord.get('ports'));
    record.getField('path')?.checkValidity();
  });
}

async function handleUpdate({
  value, name, record, dataSet,
}:any) {
  if (name === 'path' && value) {
    dataSet.forEach((eachRecord:Record) => {
      if (record.id !== eachRecord.id) {
        eachRecord.getField('path')?.checkValidity();
      }
    });
  }
}

export default ({ formatMessage, projectId, ingressId }:any):any => {
  async function checkPath(value: string, name: any, record: { cascadeParent?: any; id?: any; dataSet?: any; }) {
    if (!record.cascadeParent) {
      return null;
    }
    const envId = record.cascadeParent.cascadeParent.get('environmentId');
    const p = /^\/(\S)*$/;
    const domain = record.cascadeParent.get('domain');
    if (!domain) return null;
    if (!value) {
      return formatMessage({ id: 'domain.path.check.notSet' });
    }
    if (p.test(value)) {
      const { dataSet } = record;
      const repeatRecord = dataSet.find((pathRecord: { id: any; get: (arg0: string) => any; }) => pathRecord.id !== record.id && pathRecord.get('path') === value);
      if (repeatRecord) {
        return formatMessage({ id: 'domain.path.check.exist' });
      }
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/ingress/check_domain?domain=${domain}&env_id=${envId}&path=${value}&id=${ingressId || ''}`);
        if (res && !res.failed) {
          return true;
        }
        return formatMessage({ id: 'domain.path.check.exist' });
      } catch (e) {
        return formatMessage({ id: 'domain.path.check.failed' });
      }
    } else {
      return formatMessage({ id: 'domain.path.check.failed' });
    }
  }

  function isRequired({ dataSet, record }:any) {
    const parentRecord = record.cascadeParent;
    const hasValue = record.cascadeParent ? parentRecord.get('name') || parentRecord.get('domain') || parentRecord.get('certId') : false;
    const dirty = dataSet.some((pathRecord: any) => pathRecord === record) && dataSet.some((pathRecord: { dirty: any; }) => pathRecord.dirty);
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
        label: formatMessage({ id: 'path' }),
        validator: checkPath,
        maxLength: 30,
      },
      {
        name: 'serviceName',
        type: 'string',
        label: formatMessage({ id: 'network' }),
        dynamicProps: {
          required: isRequired,
        },
      },
      {
        name: 'servicePort',
        type: 'number',
        label: formatMessage({ id: 'port' }),
        dynamicProps: {
          required: isRequired,
        },
      },
      {
        name: 'ports',
        type: 'object',
        ignore: 'always',
      },
    ],
    events: {
      create: handleCreate,
      update: handleUpdate,
      remove: handleCreate,
    },
  });
};
