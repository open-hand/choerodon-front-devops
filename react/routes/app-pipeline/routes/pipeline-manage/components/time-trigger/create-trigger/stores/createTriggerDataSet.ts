const triggerWayData: any = [{
  name: '周期触发',
  value: 'cycle',
}, {
  name: '单次触发',
  value: 'single',
}];

const datePickData = [];

const mapping: any = {
  planName: {
    name: 'planName',
    type: 'string',
    label: '定时计划名称',
    maxLength: 30,
    required: true,
  },
  branch: {
    name: 'branch',
    type: 'string',
    label: '执行分支',
    required: true,
  },
  triggerWay: {
    name: 'triggerWay',
    type: 'string',
    defaultValue: triggerWayData[0].value,
  },
  datePick: {
    name: 'datePick',
    type: 'string',
    label: '日期选择',
    multiple: ',',
  },
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    return item;
  }),
});

export default Index;

export {
  mapping,
  triggerWayData,
};
