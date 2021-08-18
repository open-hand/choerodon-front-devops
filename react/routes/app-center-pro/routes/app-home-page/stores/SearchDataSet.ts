import { DataSetProps, DataSet } from '@/interface';

interface SearchProps {
  envDs: DataSet,
  hostDs: DataSet,
  ALL_ENV_KEY: string,
}

export default ({ envDs, hostDs, ALL_ENV_KEY }: SearchProps): DataSetProps => ({
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
    {
      name: 'hostId',
      textField: 'name',
      valueField: 'id',
      defaultValue: ALL_ENV_KEY,
      options: hostDs,
    },
  ],
});
