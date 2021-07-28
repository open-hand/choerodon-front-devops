export default () => ({
  selection: false,
  paging: false,
  dataKey: null,
  fields: [
    { name: 'name', type: 'string' },
    { name: 'id', type: 'string' },
  ],
  transport: {
    read: {
      method: 'get',
    },
  },
});
