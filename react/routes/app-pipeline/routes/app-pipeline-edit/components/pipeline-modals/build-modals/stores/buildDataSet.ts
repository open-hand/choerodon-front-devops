import { DataSet } from 'choerodon-ui/pro';
import { appServiceApiConfig } from '@choerodon/master';

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
    textField: 'branchName',
    valueField: 'branchName',
  },
};

const Index = (appServiceId: any): any => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    switch (key) {
      case 'triggerValue': {
        item.options = new DataSet({
          paging: true,
          autoQuery: true,
          transport: {
            read: () => ({
              ...appServiceApiConfig.getBrachs(appServiceId),
            }),
          },
        });
        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
});

export default Index;
export { mapping, triggerTypeOptionsData };
