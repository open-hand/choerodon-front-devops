/* eslint-disable import/no-anonymous-default-export */
function domainValidator(dataSet:any) {
  dataSet.forEach((eachRecord:any) => eachRecord.getField('key').checkValidity());
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
  function checkKey(value:any, name:any, record:any) {
    const pa = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/;
    if (value) {
      if (!pa.test(value)) {
        return formatMessage({ id: 'domain.annotation.check.failed' });
      }
      const ds = record.dataSet;
      const hasRepeat = ds.some((annotationRecord:any) => annotationRecord.id !== record.id && value === annotationRecord.get('key'));
      if (hasRepeat) {
        return formatMessage({ id: 'domain.annotation.check.repeat' });
      }
    }
    return null;
  }

  function checkValue(value:any, name:any, record:any) {
    if (!value && record.get('key')) {
      return formatMessage({ id: 'mapping.keyValueSpan' });
    }
    return null;
  }

  return ({
    autoCreate: true,
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
