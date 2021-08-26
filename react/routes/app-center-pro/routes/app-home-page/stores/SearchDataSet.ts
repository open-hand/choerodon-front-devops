/* eslint-disable import/no-anonymous-default-export */
import { DataSetProps, DataSet, Record } from '@/interface';
import { ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';

interface SearchProps {
  envDs: DataSet,
  hostDs: DataSet,
  ALL_ENV_KEY: string,
}

export default ({ envDs, hostDs, ALL_ENV_KEY }: SearchProps): any => ({
  autoCreate: true,
  selection: false,
  fields: [
    {
      name: 'typeKey',
      type: 'string',
      defaultValue: ENV_TAB,
      ignore: 'always',
    },
    {
      name: 'params',
    },
    {
      name: 'env_id',
      textField: 'name',
      valueField: 'id',
      defaultValue: ALL_ENV_KEY,
      dynamicProps: {
        ignore: ({ record }:{
          record: Record
        }) => {
          const isEnv = record.get('typeKey') === ENV_TAB;
          const current = record.get('env_id');
          return isEnv && Number(current) ? 'never' : 'always';
        },
      },
      options: envDs,
    },
    {
      name: 'host_id',
      textField: 'name',
      valueField: 'id',
      defaultValue: ALL_ENV_KEY,
      dynamicProps: {
        ignore: ({ record }:{
          record: Record
        }) => {
          const isHost = record.get('typeKey') === HOST_TAB;
          const current = record.get('host_id');
          return isHost && Number(current) ? 'never' : 'always';
        },
      },
      options: hostDs,
    },
  ],
});
