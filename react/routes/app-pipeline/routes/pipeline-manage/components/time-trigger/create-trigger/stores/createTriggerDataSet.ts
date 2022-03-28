import { DataSet } from 'choerodon-ui/pro';
import moment from 'moment';

const datePickData = [{
  name: '周一',
  value: '1',
}, {
  name: '周二',
  value: '2',
}, {
  name: '周三',
  value: '3',
}, {
  name: '周四',
  value: '4',
}, {
  name: '周五',
  value: '5',
}, {
  name: '周六',
  value: '6',
}, {
  name: '周日',
  value: '7',
}];

const triggerWayData: any = [{
  name: '周期触发',
  value: 'period',
}, {
  name: '单次触发',
  value: 'single',
}];

const mapping: any = {
  planName: {
    name: 'name',
    type: 'string',
    label: '定时计划名称',
    maxLength: 30,
    required: true,
  },
  branch: {
    name: 'ref',
    type: 'string',
    label: '执行分支',
    required: true,
  },
  triggerWay: {
    name: 'triggerType',
    type: 'string',
    defaultValue: triggerWayData[0].value,
  },
  datePick: {
    name: 'weekNumber',
    type: 'string',
    label: '日期选择',
    multiple: ',',
    textField: 'name',
    value: 'value',
    required: true,
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
    dynamicProps: {
      required: ({ record }: any) => record?.get(mapping.triggerWay.name)
      === triggerWayData[0].value,
    },
  },
  timeInterval: {
    name: 'period',
    type: 'string',
    label: '时间间隔',
    textField: 'name',
    valueField: 'value',
    options: new DataSet({
      data: [{
        name: '10分钟',
        value: '10',
      }, {
        name: '20分钟',
        value: '20',
      }, {
        name: '30分钟',
        value: '30',
      }, {
        name: '40分钟',
        value: '40',
      }, {
        name: '50分钟',
        value: '50',
      }, {
        name: '60分钟',
        value: '60',
      }, {
        name: '120分钟',
        value: '120',
      }, {
        name: '240分钟',
        value: '240',
      }],
    }),
    dynamicProps: {
      required: ({ record }: any) => record?.get(mapping.triggerWay.name)
      === triggerWayData[0].value,
    },
  },
  executeTime: {
    name: 'executeTime',
    type: 'time',
    label: '执行时间',
    format: 'HH:mm',
    dynamicProps: {
      required: ({ record }: any) => record?.get(mapping.triggerWay.name)
      === triggerWayData[1].value,
    },

  },
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    return item;
  }),
});

const transformSubmitData = (ds: any) => {
  const record = ds?.current;
  return ({
    [mapping.planName.name]: record?.get(mapping.planName.name),
    [mapping.branch.name]: record?.get(mapping.branch.name),
    [mapping.triggerWay.name]: record?.get(mapping.triggerWay.name),
    [mapping.datePick.name]: record?.get(mapping.datePick.name).join(','),
    [mapping.executeTime.name]: record?.get(mapping.executeTime.name) ? moment(record?.get(mapping.executeTime.name)).format('HH:mm') : '',
    startHourOfDay: record?.get(mapping.timePeriod.name)?.length === 2 ? moment(record?.get(mapping.timePeriod.name)[0]).format('H') : '',
    endHourOfDay: record?.get(mapping.timePeriod.name)?.length === 2 ? moment(record?.get(mapping.timePeriod.name)[1]).format('H') : '',
    [mapping.timeInterval.name]: record?.get(mapping.timeInterval.name),
  });
};

export default Index;

export {
  mapping,
  triggerWayData,
  transformSubmitData,
};
