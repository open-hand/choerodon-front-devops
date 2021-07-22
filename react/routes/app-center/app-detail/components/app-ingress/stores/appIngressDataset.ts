/* eslint-disable import/no-anonymous-default-export */
import HostConfigApi from '@/components/app-ingress-table/apis';
import Apis from '@/routes/app-center/apis';

export default ({ projectId, hostId, appServiceId }:any):any => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: {
      url: Apis.getAppIngress(projectId, appServiceId, hostId),
      method: 'get',
    },
    // destroy: ({ data: [data] }:any) => ({
    //   url: HostConfigApi.dockerDelete(projectId, data.hostId, data.id),
    //   method: 'delete',
    // }),
  },
  fields: [
    {
      type: 'string',
      name: 'name',
      label: '名称',
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
      label: '部署者',
    },
    {
      type: 'string',
      name: 'creationDate',
      label: '部署时间',
    },
  ],
});
