import { DataSetProps, DataSet } from '@/interface';

interface SearchProps {
  envDs: DataSet,
  ALL_ENV_KEY: string,
}

export default ({ envDs, ALL_ENV_KEY }: SearchProps): DataSetProps => ({
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
      defaultValue: ALL_ENV_KEY,
      options: envDs,
    },
  ],
});
