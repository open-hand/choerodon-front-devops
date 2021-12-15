const mapping: {
    [key: string]: any
} = {
  name: {
    name: 'name',
    type: 'string',
    label: '任务名称',
    required: true,
  },
  appService: {
    name: 'appService',
    type: 'string',
    label: '关联应用服务',
    required: true,
    disabled: true,
  },
  triggerType: {
    name: 'triggerType',
    type: 'string',
    label: '匹配类型',
    required: true,
  },
  triggerValue: {
    name: 'triggerValue',
    type: 'string',
    label: '触发分支',
  },
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});

export default Index;
export { mapping };
