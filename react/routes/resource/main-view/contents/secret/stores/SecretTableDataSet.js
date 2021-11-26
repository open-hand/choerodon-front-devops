export default ({ formatMessage }) => ({
  selection: false,
  pageSize: 10,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string', label: formatMessage({ id: 'name' }) },
    { name: 'description', type: 'string', label: formatMessage({ id: 'description' }) },
    { name: 'key', type: 'object', label: formatMessage({ id: 'key' }) },
    { name: 'value', type: 'object' },
    { name: 'commandStatus', type: 'string' },
    { name: 'lastUpdateDate', type: 'string', label: formatMessage({ id: 'boot.updateDate' }) },
  ],
  queryFields: [
    { name: 'name', type: 'string', label: formatMessage({ id: 'name' }) },
  ],
});
