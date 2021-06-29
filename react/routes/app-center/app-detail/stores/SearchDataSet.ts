import { DataSetProps, DataSet, FieldType } from '@/interface';

interface SearchProps {
  envDs: DataSet,
}

export default ({ envDs }: SearchProps): DataSetProps => ({
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
  ],
});
