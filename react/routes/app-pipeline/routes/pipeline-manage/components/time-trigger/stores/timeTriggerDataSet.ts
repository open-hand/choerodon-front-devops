import {
  ciPipelineSchedulesApiConfig,
} from '@choerodon/master';
import {
  triggerWayData,
} from '../create-trigger/stores/createTriggerDataSet';

const mapping: any = {
  planName: {
    name: 'name',
    type: 'string',
    label: '定时计划名称',
  },
  branch: {
    name: 'ref',
    type: 'string',
    label: '执行分支/标记',
  },
  triggerWay: {
    name: 'triggerType',
    type: 'string',
    label: '触发方式',
  },
  nextTime: {
    name: 'nextRunAt',
    type: 'string',
    label: '下次执行时间',
  },
  updater: {
    name: 'realName',
    type: 'string',
    label: '更新者',
  },
};

const Index = (appServiceId: any): any => ({
  autoQuery: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    return item;
  }),
  paging: false,
  transport: {
    read: () => ({
      ...ciPipelineSchedulesApiConfig.getPlanList({ appServiceId }),
      transformResponse: (res: any) => {
        let newRes = res;
        try {
          newRes = JSON.parse(newRes);
          return d(newRes);
        } catch (e) {
          return d(newRes);
        }
        function d(result: any) {
          return result.map((item: any) => ({
            ...item,
            realName: item?.userDTO?.realName,
            triggerType: triggerWayData?.find((i: any) => i.value === item?.triggerType)?.name,
          }));
        }
      },
    }),
  },
  selection: false,
});

export default Index;

export {
  mapping,
};
