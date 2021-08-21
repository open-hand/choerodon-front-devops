const AppDetailDs = ():any => ({
  autoQuery: false,
  selection: false,
  paging: false,
  dataKey: null,
  transport: {
    read: {
      method: 'get',
      url: '/devops/v1/projects/159349538124681216/app_service_instances/216159092320714752',
    },
  },
  fields: [
    { name: 'realName', type: 'string' },
    { name: 'userImage', type: 'string' },
    { name: 'createTime', type: 'string' },
    { name: 'loginName', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'podEventVO', type: 'object' },
  ],
});

export default AppDetailDs;
