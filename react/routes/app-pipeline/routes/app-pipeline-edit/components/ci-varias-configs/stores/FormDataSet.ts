/* eslint-disable consistent-return */

import { DataSet, Record } from '@/interface';

const CiConfigDs = ({
  formatAppPipeline,
  setSavedData,
}:any):any => {
  function handleDataChangeCallback({ dataSet }:any) {
    setSavedData(dataSet.toData());
  }

  function checkKey(value:string, _name:string, record:Record) {
    const p = /^([_A-Za-z0-9])+$/;
    if (!value && !record.get('variableValue')) {
      return;
    }
    if (!value && record.get('variableValue')) {
      return formatAppPipeline({ id: 'check.empty' });
    }
    if (p.test(value)) {
      const { dataSet } = record;
      const repeatRecord = dataSet.find((eachRecord) => eachRecord.id !== record.id && eachRecord.get('variableKey') === value);
      if (repeatRecord) {
        return formatAppPipeline({ id: 'check.exist' });
      }
    } else {
      return formatAppPipeline({ id: 'check.failed' });
    }
  }

  function handleUpdate({
    value, name, record, dataSet,
  }:any) {
    if (name === 'variableKey' && value) {
      dataSet.forEach((eachRecord:Record) => {
        if (record.id !== eachRecord.id) {
          eachRecord.getField('variableKey')?.checkValidity();
        }
      });
    }

    handleDataChangeCallback({ dataSet });
  }

  function handleRemove({ dataSet }:{dataSet:DataSet}) {
    dataSet.forEach((record) => {
      record.getField('variableKey')?.checkValidity();
    });

    handleDataChangeCallback({ dataSet });
  }

  return ({
    autoCreate: true,
    selection: false,
    paging: false,
    dataKey: null,
    fields: [
      {
        name: 'variableKey', type: 'string', label: formatAppPipeline({ id: 'key' }), validator: checkKey,
      },
      { name: 'variableValue', type: 'string', label: formatAppPipeline({ id: 'value' }) },
    ],
    events: {
      update: handleUpdate,
      remove: handleRemove,
    },
  });
};

export default CiConfigDs;
