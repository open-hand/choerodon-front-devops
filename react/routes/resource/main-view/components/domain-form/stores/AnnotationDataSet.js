function domainValidator(dataSet) {
  dataSet.forEach((eachRecord) => eachRecord.getField('key').checkValidity());
}

function handleUpdate({
  value, name, record, dataSet,
}) {
  if (name === 'key') {
    domainValidator(dataSet);
  }
}

function handleRemove({ dataSet }) {
  domainValidator(dataSet);
}

export default ({ formatMessage }) => {
  function checkKey(value, name, record) {
    const pa = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/;
    if (value) {
      if (!pa.test(value)) {
        return formatMessage({ id: 'domain.annotation.check.failed' });
      }
      const ds = record.dataSet;
      const hasRepeat = ds.some((annotationRecord) => annotationRecord.id !== record.id && value === annotationRecord.get('key'));
      if (hasRepeat) {
        return formatMessage({ id: 'domain.annotation.check.repeat' });
      }
    }
  }

  function checkValue(value, name, record) {
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
