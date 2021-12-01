/* eslint-disable consistent-return */

import isEmpty from 'lodash/isEmpty';
import { DataSet, Record } from '@/interface';

function handleLoad({ dataSet }:{dataSet:DataSet}) {
  if (!dataSet.length) {
    dataSet.loadData([{ key: null, value: null }]);
  }
}

function handleUpdate({
  value, name, record, dataSet,
}:any) {
  if (name === 'key' && value) {
    dataSet.forEach((eachRecord:Record) => {
      if (record.id !== eachRecord.id) {
        eachRecord.getField('key')?.checkValidity();
      }
    });
  }
}

function handleRemove({ dataSet }:{dataSet:DataSet}) {
  dataSet.forEach((record) => {
    record.getField('key')?.checkValidity();
  });
}

const CiConfigDs = ({
  formatAppPipeline,
}:any):any => {
  // const urlParams = appServiceId ? `app_service_id=${appServiceId}&level=app` : 'level=project';
  function checkKey(value:string, _name:string, record:Record) {
    const p = /^([_A-Za-z0-9])+$/;
    if (!value && !record.get('value')) {
      return;
    }
    if (!value && record.get('value')) {
      return formatAppPipeline({ id: 'check.empty' });
    }
    if (p.test(value)) {
      const { dataSet } = record;
      const repeatRecord = dataSet.find((eachRecord) => eachRecord.id !== record.id && eachRecord.get('key') === value);
      if (repeatRecord) {
        return formatAppPipeline({ id: 'check.exist' });
      }
    } else {
      return formatAppPipeline({ id: 'check.failed' });
    }
  }

  return ({
    autoCreate: true,
    // autoQuery: true,
    selection: false,
    paging: false,
    dataKey: null,
    transport: {
      // read: {
      //   url: `devops/v1/projects/${projectId}/ci_variable/values?${urlParams}`,
      //   method: 'get',
      // },
    },
    fields: [
      {
        name: 'key', type: 'string', label: formatAppPipeline({ id: 'key' }), validator: checkKey,
      },
      { name: 'value', type: 'string', label: formatAppPipeline({ id: 'value' }) },
    ],
    events: {
      load: handleLoad,
      update: handleUpdate,
      remove: handleRemove,
    },
  });
};

export default CiConfigDs;
