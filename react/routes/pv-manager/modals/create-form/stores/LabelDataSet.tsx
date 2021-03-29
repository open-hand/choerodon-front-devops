import {
  DataSetProps, FieldType, Record, DataSet,
} from '@/interface';

interface LabelProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
}

function keyValidator(dataSet: DataSet) {
  dataSet.forEach((eachRecord: Record) => eachRecord.getField('key')?.checkValidity());
}

function handleUpdate({
  name, dataSet,
}: { name: string, dataSet: DataSet }) {
  if (name === 'key') {
    keyValidator(dataSet);
  }
}

function handleRemove({ dataSet }: { dataSet: DataSet }) {
  keyValidator(dataSet);
}

export default (({ formatMessage, intlPrefix }: LabelProps): DataSetProps => {
  const checkKey = (value: any, name: string, record: Record) => {
    const p = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
    if (!value && !record.get('value')) {
      return true;
    }
    if (!value && record.get('value')) {
      return formatMessage({ id: 'mapping.keyValueSpan' });
    }
    if (p.test(value)) {
      const { dataSet } = record;
      const repeatRecord = dataSet?.find((eachRecord: Record) => eachRecord.id !== record.id && eachRecord.get('key') === value);
      if (repeatRecord) {
        return formatMessage({ id: `${intlPrefix}.label.exist` });
      }
      return true;
    }
    return formatMessage({ id: `${intlPrefix}.label.failed` });
  };

  const checkValue = (value: any, name: string, record: Record) => {
    const p = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
    if (!value && record.get('key')) {
      return formatMessage({ id: 'mapping.keyValueSpan' });
    }
    if (value && !p.test(value)) {
      return formatMessage({ id: `${intlPrefix}.label.failed` });
    }
    return true;
  };

  return ({
    autoCreate: true,
    autoQuery: false,
    selection: false,
    paging: false,
    transport: {},
    fields: [
      {
        name: 'key',
        type: 'string' as FieldType,
        label: formatMessage({ id: 'key' }),
        // @ts-ignore
        validator: checkKey,
        maxLength: 63,
      },
      {
        name: 'value',
        type: 'string' as FieldType,
        label: formatMessage({ id: 'value' }),
        // @ts-ignore
        validator: checkValue,
        maxLength: 63,
      },
    ],
    events: {
      update: handleUpdate,
      remove: handleRemove,
    },
  });
});
