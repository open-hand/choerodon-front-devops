/* eslint-disable import/no-anonymous-default-export */
import Apis from '@/routes/app-center/apis';

export default ():any => ({
  autoQuery: true,
  selection: false,
  // transport: {
  //   read: {
  //     url: Apis.getAppIngress(),
  //     method: 'get',
  //   },
  //   destroy: {
  //     url: Apis.deleteAppIngress(),
  //     method: 'delete',
  //   },
  // },
  data: [
    {
      name: 'hellowrold',
      status: 'success',
      progressPort: '#sdadas',
      port: '12121',
      deployer: 'motherfucker',
      date: '2019-06-29 01:01:03',
    },
    {
      name: 'hellowrold',
      status: 'success',
      progressPort: '#sdadas',
      port: '12121',
      deployer: 'motherfucker',
      date: '2019-06-29 01:01:03',
    },
    {
      name: 'hellowrold',
      status: 'success',
      progressPort: '#sdadas',
      port: '12121',
      deployer: 'motherfucker',
      date: '2019-06-29 01:01:03',
    },
  ],
  fields: [
    {
      type: 'string',
      name: 'name',
      label: '名称',
    },
    {
      type: 'string',
      name: 'status',
      label: '状态',
    },
    {
      type: 'string',
      name: 'progressPort',
      label: '进程号',
    },
    {
      type: 'string',
      name: 'port',
      label: '占用端口',
    },
    {
      type: 'string',
      name: 'deployer',
      label: '部署者',
    },
    {
      type: 'string',
      name: 'date',
      label: '部署时间',
    },
  ],
});
