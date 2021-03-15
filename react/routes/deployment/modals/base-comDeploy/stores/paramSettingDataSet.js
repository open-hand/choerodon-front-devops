const mapping = {
  params: {
    name: 'params',
    type: 'string',
    label: '参数',
  },
  defaultParams: {
    name: 'defaultParams',
    type: 'string',
    label: '参数默认值',
  },
  paramsScope: {
    name: 'paramScope',
    type: 'string',
    label: '参数范围',
  },
  paramsRunnigValue: {
    name: 'paramsRunningValue',
    type: 'string',
    label: '参数运行值',
  },
};

export { mapping };

export default () => ({
  selection: false,
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});
