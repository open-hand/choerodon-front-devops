import {
  ciPipelineSchedulesApiConfig,
} from '@choerodon/master';
import JSONbig from 'json-bigint';
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
  },
  triggerWay: {
    name: 'triggerTypeName',
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
  autoQuery: false,
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
          newRes = JSONbig.parse(newRes);
          return d(newRes);
        } catch (e) {
          return d(newRes);
        }
        function d(result: any) {
          return result?.map ? result?.map((item: any) => ({
            ...item,
            realName: item?.userDTO?.realName,
            triggerTypeName: triggerWayData?.find((i: any) => i.value === item?.triggerType)?.name,
          })) : [];
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
