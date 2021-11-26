/* eslint-disable import/no-anonymous-default-export */
export default ({ formatMessage, intlPrefix }:any):any => ({
  selection: false,
  pageSize: 10,
  transport: {},
  fields: [
    {
      name: 'status',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.pod.status` }),
    },
    {
      name: 'name',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.instance.pod` }),
    },
    {
      name: 'containers',
      type: 'object',
      label: formatMessage({ id: 'container' }),
    },
    {
      name: 'ip',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.instance.ip` }),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: formatMessage({ id: 'boot.createDate' }),
    },
  ],
});
