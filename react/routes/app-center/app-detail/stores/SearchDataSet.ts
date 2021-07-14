import { DataSetProps, DataSet, FieldType } from '@/interface';

interface SearchProps {
  envDs: DataSet,
  hostDs: DataSet,
}

export default ({ envDs, hostDs }: SearchProps): DataSetProps => ({
  autoCreate: true,
  selection: false,
  fields: [
    {
      name: 'env',
      type: 'object' as FieldType,
      textField: 'name',
      valueField: 'id',
      options: envDs,
    },
    {
      name: 'host',
      type: 'object' as FieldType,
      textField: 'name',
      valueField: 'id',
      options: hostDs,
    },
  ],
});
