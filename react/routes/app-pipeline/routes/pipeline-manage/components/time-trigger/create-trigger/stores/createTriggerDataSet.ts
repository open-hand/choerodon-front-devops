import { DataSet } from 'choerodon-ui/pro';

const datePickData = [{
  name: '周一',
  value: 'monday',
}, {
  name: '周二',
  value: 'tuesday',
}, {
  name: '周三',
  value: 'Wednesday',
}, {
  name: '周四',
  value: 'thursday',
}, {
  name: '周五',
  value: 'friday',
}, {
  name: '周六',
  value: 'saturday',
}, {
  name: '周日',
  value: 'sunday',
}];

const triggerWayData: any = [{
  name: '周期触发',
  value: 'cycle',
}, {
  name: '单次触发',
  value: 'single',
}];

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
    textField: 'name',
    value: 'value',
    options: new DataSet({
      data: datePickData,
    }),
  },
  timePeriod: {
    name: 'timePeriod',
    type: 'time',
    label: '时间段',
    range: true,
    format: 'HH',
  },
  timeInterval: {
    name: 'timeInterval',
    type: 'string',
    label: '时间间隔',
  },
  executeTime: {
    name: 'executeTime',
    type: 'time',
    label: '执行时间',
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
