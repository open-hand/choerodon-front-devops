export default ({ intl, intlPrefix, format }) => ({
  selection: false,
  pageSize: 10,
  transport: {},
  fields: [
    {
      name: 'status',
      type: 'string',
      label: format({ id: 'PodStatus' }),
    },
    {
      name: 'name',
      type: 'string',
      label: format({ id: 'Pod' }),
    },
    {
      name: 'containers',
      type: 'object',
      label: format({ id: 'Container' }),
    },
    {
      name: 'ip',
      type: 'string',
      label: 'ip',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: format({ id: 'CreationTime' }),
    },
  ],
});
