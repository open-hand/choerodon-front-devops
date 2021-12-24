import { DataSet } from 'choerodon-ui/pro';
import { appServiceApi } from '@choerodon/master';

const transformSubmitData = (ds: any) => {
  const record = ds?.current;
  return ({
    [mapping.name.name]: record?.get(mapping.name.name),
    [mapping.triggerType.name]: record?.get(mapping.triggerType.name),
    [mapping.triggerValue.name]: record?.get(mapping.triggerValue.name)?.join(','),
  });
};

const transformLoadData = (data: any, appServiceName: any) => ({
  [mapping.name.name]: data?.[mapping.name.name],
  [mapping.appService.name]: appServiceName,
  [mapping.triggerType.name]: data?.[mapping.triggerType.name],
  [mapping.triggerValue.name]: data?.[mapping.triggerValue.name]?.split(','),
});

let triggerValueAxiosData: any = [];

const triggerTypeOptionsData = [{
  text: '分支类型匹配',
  value: 'refs',
}, {
  text: '正则匹配',
  value: 'regex',
}, {
  text: '精确匹配',
  value: 'exact_match',
}, {
  text: '精确排除',
  value: 'exact_exclude',
}];

const originTriggerValueData = [{
  value: 'master',
  text: 'master',
}, {
  value: 'feature',
  text: 'feature',
}, {
  value: 'bugfix',
  text: 'bugfix',
}, {
  value: 'hotfix',
  text: 'hotfix',
}, {
  value: 'release',
  text: 'release',
}, {
  value: 'tag',
  text: 'tag',
}];

const mapping: {
    [key: string]: any
} = {
  name: {
    name: 'name',
    type: 'string',
    label: '任务名称',
    required: true,
    maxLength: 30,
  },
  appService: {
    name: 'appServiceName',
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
    textField: 'text',
    valueField: 'value',
    defaultValue: 'refs',
    options: new DataSet({
      data: triggerTypeOptionsData,
    }),
  },
  triggerValue: {
    name: 'triggerValue',
    type: 'string',
    label: '触发分支',
    multiple: true,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: originTriggerValueData,
    }),
  },
};

const Index = (appServiceId: any): any => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    switch (key) {
      case 'triggerValue': {
        // item.options = new DataSet({
        //   paging: true,
        //   autoQuery: true,
        //   transport: {
        //     read: () => ({
        //       ...appServiceApiConfig.getBrachs(appServiceId),
        //     }),
        //   },
        // });
        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
  events: {
    create: async () => {
      if (appServiceId) {
        const res = await appServiceApi.getBrachs(appServiceId);
        triggerValueAxiosData = res.content.map((i: any) => ({
          text: i?.branchName,
          value: i?.branchName,
        }));
      }
    },
    update: ({ name, value, record }: any) => {
      switch (name) {
        case mapping.triggerType.name: {
          if (value === triggerTypeOptionsData[0].value) {
            record.getField(mapping.triggerValue.name).options.loadData(originTriggerValueData);
          } else if (value !== triggerTypeOptionsData[1].value) {
            // eslint-disable-next-line no-param-reassign
            record.getField(mapping.triggerValue.name).options.loadData(triggerValueAxiosData);
          }
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});

export default Index;
export {
  mapping, triggerTypeOptionsData, transformSubmitData, transformLoadData,
};
