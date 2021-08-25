import { FieldProps, DataSetProps } from '@/interface';

const optionDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: [{
    name: 'key',
    type: 'string',
    label: '键',
    dynamicProps: {
      required: ({ record }) => record.get('value'),
    },
  }, {
    name: 'value',
    type: 'string',
    label: '值',
    dynamicProps: {
      required: ({ record }) => record.get('key'),
    },
  }] as FieldProps[],
});

export default optionDataSet;
