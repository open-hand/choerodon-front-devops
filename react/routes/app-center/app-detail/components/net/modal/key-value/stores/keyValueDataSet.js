export default () => ({
  autoCreate: typeof id !== 'number',
  fields: [{
    name: 'key',
    type: 'string',
    label: '键',
  }, {
    name: 'value',
    type: 'string',
    label: '值',
  }],
});
