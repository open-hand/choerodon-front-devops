/* eslint-disable import/no-anonymous-default-export */
import map from 'lodash/map';
import { DataSet } from 'choerodon-ui/pro';
import { DataSet as DataSetInterface, Record } from '@/interface';
import { ENV_TAB, HOST_TAB, APP_OPERATION } from '@/routes/app-center-pro/stores/CONST';

interface SearchProps {
  envDs: DataSetInterface,
  hostDs: DataSetInterface,
  ALL_ENV_KEY: string,
  formatMessage:any
  replaceCurrentState: (fiedls:string, value:any)=>void,
  format: any,
}

export default ({
  envDs, hostDs, ALL_ENV_KEY, formatMessage, replaceCurrentState, format,
}: SearchProps): any => ({
  autoCreate: true,
  selection: false,
  events: {
    update: ({
      dataSet, record, name, value, oldValue,
    }:any) => {
      replaceCurrentState(name, value);
    },
  },
  fields: [
    {
      name: 'typeKey',
      type: 'string',
    },
    {
      name: 'params',
      type: 'string',
    },
    {
      name: 'rdupm_type',
      label: '应用类型',
      type: 'string',
      textField: 'name',
      valueField: 'value',
      dynamicProps: {
        ignore: ({ record }:{
          record: Record
        }) => record.get('typeKey') === ENV_TAB,
      },
      options: new DataSet({
        data: [
          {
            name: format({ id: 'ChartPackage' }),
            value: 'chart',
          },
          {
            name: format({ id: 'Deployment' }),
            value: 'deployment',
          },
        ],
      }),
    },
    {
      name: 'operation_type',
      type: 'string',
      label: '操作类型',
      textField: 'name',
      valueField: 'value',
      options: new DataSet({
        data: map(APP_OPERATION, (value:keyof typeof APP_OPERATION) => ({
          name: format({ id: value }),
          value,
        })),
      }),
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
          return isEnv && current !== ALL_ENV_KEY ? 'never' : 'always';
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
          return isHost && current !== ALL_ENV_KEY ? 'never' : 'always';
        },
      },
      options: hostDs,
    },
  ],
});
