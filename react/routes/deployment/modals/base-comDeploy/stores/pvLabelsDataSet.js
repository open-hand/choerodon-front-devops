export default () => ({
  autoCreate: true,
  fields: [{
    name: 'key',
    type: 'string',
    label: '键',
    required: true,
  }, {
    name: 'value',
    type: 'string',
    label: '值',
    required: true,
  }],
});
