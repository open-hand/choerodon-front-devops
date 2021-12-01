export default (seletDs) => ({
  autoCreate: true,
  fields: [{
    name: 'pageSize',
    type: 'number',
    defaultValue: 20,
  }, {
    name: 'appServiceId',
    type: 'object',
    label: '关联应用服务',
    required: true,
    textField: 'appServiceName',
    valueField: 'appServiceId',
    options: seletDs,
  }],
});
