import { DataSetProps, DataSet } from '@/interface';

interface SearchProps {
  envDs: DataSet,
}

export default ({ envDs }: SearchProps): DataSetProps => ({
  autoCreate: true,
  selection: false,
  fields: [
    {
      name: 'params',
    },
    {
      name: 'envId',
      textField: 'name',
      valueField: 'id',
      options: envDs,
    },
  ],
});
