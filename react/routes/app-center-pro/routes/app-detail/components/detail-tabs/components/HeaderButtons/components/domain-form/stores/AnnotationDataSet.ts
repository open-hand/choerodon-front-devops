/* eslint-disable */
function domainValidator(dataSet: any[]) {
  dataSet.forEach((eachRecord: { getField: (arg0: string) => { (): any; new(): any; checkValidity: { (): any; new(): any; }; }; }) => eachRecord.getField('key').checkValidity());
}

function handleUpdate({
  value, name, record, dataSet,
}:any) {
  if (name === 'key') {
    domainValidator(dataSet);
  }
}

function handleRemove({ dataSet }:any) {
  domainValidator(dataSet);
}

export default ({ formatMessage }:any):any => {
  function checkKey(value: string, name: any, record: { dataSet: any; id: any; }) {
    const pa = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/;
    if (value) {
      if (!pa.test(value)) {
        return formatMessage({ id: 'domain.annotation.check.failed' });
      }
      const ds = record.dataSet;
      const hasRepeat = ds.some((annotationRecord: { id: any; get: (arg0: string) => any; }) => annotationRecord.id !== record.id && value === annotationRecord.get('key'));
      if (hasRepeat) {
        return formatMessage({ id: 'domain.annotation.check.repeat' });
      }
    }
  }

  function checkValue(value: any, name: any, record: { get: (arg0: string) => any; }) {
    if (!value && record.get('key')) {
      return formatMessage({ id: 'mapping.keyValueSpan' });
    }
  }

  return ({
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'key',
        type: 'string',
        validator: checkKey,
        maxLength: 316,
        label: formatMessage({ id: 'key' }),
      },
      {
        name: 'value',
        type: 'string',
        validator: checkValue,
        label: formatMessage({ id: 'value' }),
      },
    ],
    events: {
      update: handleUpdate,
      remove: handleRemove,
    },
  });
};
