export default (formatMessage:any, intlPrefix:string):any => ({
  autoQuery: false,
  selection: false,
  paging: false,
  fields: [
    { name: 'name', type: 'string', label: formatMessage({ id: `${intlPrefix}.instance.pod` }) },
    { name: 'instanceName', type: 'string', label: formatMessage({ id: 'instance' }) },
    { name: 'memoryUsed', type: 'string', label: formatMessage({ id: `${intlPrefix}.used.memory` }) },
    { name: 'cpuUsed', type: 'string', label: formatMessage({ id: `${intlPrefix}.used.cpu` }) },
    { name: 'podIp', type: 'string', label: formatMessage({ id: `${intlPrefix}.instance.ip` }) },
    { name: 'creationDate', type: 'string', label: formatMessage({ id: 'boot.createDate' }) },
  ],
  transport: {
    read: {
      method: 'get',
    },
  },
});
