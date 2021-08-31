import { DataSet } from '@/interface';

const DsBasicObj = {
  fields: [
    {
      type: 'string',
      name: 'name',
      label: '应用名称',
    },
    {
      type: 'string',
      name: 'instanceType',
      label: '类型',
    },
    {
      type: 'string',
      name: 'status',
      label: '状态',
    },
    {
      type: 'string',
      name: 'pid',
      label: '进程号',
    },
    {
      type: 'string',
      name: 'ports',
      label: '占用端口',
    },
    {
      type: 'object',
      name: 'deployer',
      label: '创建者',
    },
    {
      type: 'string',
      name: 'creationDate',
      label: '创建时间',
    },
  ],
  queryFields: [
    { name: 'name', label: '名称' },
    { name: 'status', label: '状态' },
    {
      name: 'type',
      label: '类型',
      textField: 'text',
      valueField: 'value',
      options: new DataSet({
        data: [
          {
            text: 'docker',
            value: 'docker_process',
          },
          {
            text: '实例进程',
            value: 'normal_process',
          },
        ],
      }),
    },
  ],
};

export default DsBasicObj;
