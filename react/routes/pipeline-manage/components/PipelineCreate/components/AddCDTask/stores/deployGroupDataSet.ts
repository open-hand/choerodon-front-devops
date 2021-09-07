import { FieldProps, FieldType } from '@/interface';

const mapping = (): {
  [key: string]: FieldProps
} => ({
  appName: {
    name: 'name',
    type: 'string' as FieldType,
    label: '应用名称',
    required: true,
  },
  appCode: {
    name: 'code',
    type: 'string' as FieldType,
    label: '应用编码',
    required: true,
  },
});

const deployGroupDataSet = () => ({
  autoCreate: true,
  fields: Object.keys(mapping()).map((i) => mapping()[i]),
});

export { mapping };
export default deployGroupDataSet;
