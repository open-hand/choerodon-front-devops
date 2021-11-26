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
      name: 'nodeName',
      label: formatMessage({ id: `${intlPrefix}.node.ip` }),
    },
    {
      name: 'status',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.node.status` }),
    },
    {
      name: 'role',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.node.type` }),
    },
    {
      name: 'createTime',
      type: 'string',
      label: formatMessage({ id: 'boot.createDate' }),
    },
  ],
});
