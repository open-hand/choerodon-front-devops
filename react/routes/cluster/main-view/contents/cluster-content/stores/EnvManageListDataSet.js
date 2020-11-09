/* eslint-disable import/no-anonymous-default-export */
export default ({ formatMessage, intlPrefix }) => ({
  selection: false,
  pageSize: 10,
  transport: {
    read: {
      method: 'get',
    },
  },
  fields: [
    {
      name: 'envDetail',
      label: formatMessage({ id: `${intlPrefix}.env.manage.detail` }),
    },
    {
      name: 'projects',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.env.manage.project` }),
    },
    {
      name: 'cpu',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.env.manage.cpu` }),
    },
    {
      name: 'stack',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.env.manage.stack` }),
    },
    {
      name: 'createTime',
      type: 'string',
      label: formatMessage({ id: 'createDate' }),
    },
  ],
});
