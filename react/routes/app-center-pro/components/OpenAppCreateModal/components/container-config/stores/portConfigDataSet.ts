import { FieldType, DataSetProps, FieldProps } from '@/interface';

const mapping: {
  [key: string]: FieldProps
} = {
  agreement: {
    name: 'agreement',
    type: 'string' as FieldType,
    label: '协议',
  },
  name: {
    name: 'name',
    type: 'string' as FieldType,
    label: '名称',
  },
  port: {
    name: 'port',
    type: 'string' as FieldType,
    label: '容器端口',
  },
};

// @ts-ignore
const portConfigDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export { mapping };

export default portConfigDataSet;
