import { DataSetProps, FieldProps, FieldType } from '@/interface';

function domainValidator(dataSet: any) {
  dataSet.forEach((eachRecord: any) => eachRecord.getField('key').checkValidity());
}

function handleUpdate({
  value, name, record, dataSet,
}: any) {
  if (name === 'key') {
    domainValidator(dataSet);
  }
}

function handleRemove({ dataSet }: any) {
  domainValidator(dataSet);
}

export default (): DataSetProps => {
  // eslint-disable-next-line consistent-return
  async function checkKey(value: any, name: any, record: any) {
    const pa = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/;
    if (value) {
      if (!pa.test(value)) {
        return '输入内容格式有误';
      }
      const ds = record.dataSet;
      const hasRepeat = ds.some((annotationRecord: any) => annotationRecord.id !== record.id && value === annotationRecord.get('key'));
      if (hasRepeat) {
        return '“键”不能重复';
      }
    }
  }

  // eslint-disable-next-line consistent-return
  async function checkValue(value: any, name: any, record: any) {
    if (!value && record.get('key')) {
      return '键值对需配对输入，请检查输入';
    }
  }

  return ({
    autoCreate: true,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'key',
        type: 'string' as FieldType,
        validator: checkKey,
        maxLength: 316,
        label: '键',
      },
      {
        name: 'value',
        type: 'string' as FieldType,
        validator: checkValue,
        label: '值',
      },
    ],
    events: {
      update: handleUpdate,
      remove: handleRemove,
    },
  });
};
