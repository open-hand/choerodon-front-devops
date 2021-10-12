/* eslint-disable import/no-anonymous-default-export */
export default ():any => ({
  paging: false,
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
