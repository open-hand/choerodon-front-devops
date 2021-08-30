import { FieldProps, DataSetProps } from '@/interface';

const optionDataSet = (keyPatter?: any): DataSetProps => ({
  autoCreate: true,
  fields: [{
    name: 'key',
    type: 'string',
    label: '键',
    validator: (value: string) => {
      if (value && keyPatter) {
        const patt = keyPatter;
        if (patt.test(value)) {
          return true;
        }
        return '格式校验失败';
      }
      return true;
    },
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
