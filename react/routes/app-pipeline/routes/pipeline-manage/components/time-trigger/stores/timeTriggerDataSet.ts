const mapping: any = {
  planName: {
    name: 'planName',
    type: 'string',
    label: '定时计划名称',
  },
  branch: {
    name: 'branch',
    type: 'string',
    label: '执行分支/标记',
  },
  triggerWay: {
    name: 'triggerWay',
    type: 'string',
    label: '触发方式',
  },
  nextTime: {
    name: 'nextTime',
    type: 'string',
    label: '下次执行时间',
  },
  updater: {
    name: 'updater',
    type: 'string',
    label: '更新者',
  },
};

const Index = (): any => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    return item;
  }),
  selection: false,
});

export default Index;

export {
  mapping,
};
