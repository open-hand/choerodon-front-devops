import { DataSet } from 'choerodon-ui/pro';
import {
  appServiceApi,
  ciTemplateJobGroupApiConfig,
  ciTemplateStepCategoryApiConfig,
  ciTemplateJobApi,
  ciTemplateStepApi,

} from '@choerodon/master';
import {
  CUSTOM_BUILD, MAVEN_BUILD, STEP_TEMPLATE, TASK_TEMPLATE,
} from '@/routes/app-pipeline/CONSTANTS';

const handleValidatorName = async (v: any, t: any, l: any, id?: any) => {
  let res = true;
  if (l === 'project') {
    return true;
  }
  if (l === 'organization') {
    if (t === TASK_TEMPLATE) {
      res = await ciTemplateJobApi.checkName(v, id);
    } else if (t === STEP_TEMPLATE) {
      res = await ciTemplateStepApi.checkOrgStepName(v, id);
    }
  } else if (t === TASK_TEMPLATE) {
    res = await ciTemplateJobApi.checkJobName(v, id);
  } else if (t === STEP_TEMPLATE) {
    res = await ciTemplateStepApi.checkStepName(v, id);
  }
  return !res ? '名称重复' : true;
};

const transformSubmitData = (ds: any) => {
  const record = ds?.current;
  return ({
    [mapping.name.name]: record?.get(mapping.name.name),
    [mapping.triggerType.name]: record?.get(mapping.triggerType.name),
    [mapping.triggerValue.name]: record?.get(mapping.triggerValue.name)?.join(','),
    [mapping.groupId.name]: record?.get(mapping.groupId.name),
    [mapping.categoryId.name]: record?.get(mapping.categoryId.name),
    [mapping.type.name]: record?.get(mapping.type.name),
    [mapping.script.name]: record?.get(mapping.script.name),
  });
};

const transformLoadData = (data: any, appServiceName: any) => ({
  [mapping.name.name]: data?.[mapping.name.name],
  [mapping.type.name]: data?.[mapping.type.name],
  [mapping.groupId.name]: data?.[mapping.groupId.name],
  [mapping.categoryId.name]: data?.[mapping.categoryId.name],
  [mapping.appService.name]: appServiceName,
  [mapping.triggerType.name]: data?.[mapping.triggerType.name],
  [mapping.triggerValue.name]: data?.[mapping.triggerValue.name]?.split(','),
  [mapping.script.name]: data?.[mapping.script.name],
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
    required: true,
  },
  groupId: {
    name: 'groupId',
    type: 'string',
    label: '所属任务分组',
    textField: 'name',
    valueField: 'id',
  },
  categoryId: {
    name: 'categoryId',
    type: 'string',
    label: '所属步骤分类',
    textField: 'name',
    valueField: 'id',
  },
  type: {
    name: 'type',
    type: 'string',
    label: '模板维护方式',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '普通创建',
        value: MAVEN_BUILD,
      }, {
        text: '自定义脚本',
        value: CUSTOM_BUILD,
      }],
    }),
  },
  appService: {
    name: 'appServiceName',
    type: 'string',
    label: '关联应用服务',
    disabled: true,
  },
  triggerType: {
    name: 'triggerType',
    type: 'string',
    label: '匹配类型',
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
  script: {
    name: 'script',
    type: 'string',
  },
};

const Index = (appServiceId: any, data: any, level: any): any => {
  const {
    template,
  } = data;
  return ({
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
        case 'appService': {
          item.required = level === 'project';
          break;
        }
        case 'triggerType': {
          item.required = level === 'project';
          break;
        }
        case 'groupId': {
          item.required = template === TASK_TEMPLATE;
          item.options = new DataSet({
            autoQuery: true,
            paging: false,
            transport: {
              read: () => ({
                ...ciTemplateJobGroupApiConfig.getList(),
              }),
            },
          });
          break;
        }
        case 'categoryId': {
          item.required = template === STEP_TEMPLATE;
          item.options = new DataSet({
            autoQuery: true,
            transport: {
              read: () => ({
                ...ciTemplateStepCategoryApiConfig.getSteps(),
              }),
            },
          });
          break;
        }
        case 'name': {
          if (data?.template) {
            if (data?.template === TASK_TEMPLATE) {
              item.label = '任务模板名称';
            } else {
              item.label = '步骤模板名称';
            }
          } else {
            item.label = '任务名称';
          }
          item.maxLength = !data?.template ? 30 : 60;
          item.validator = async (value: string) => handleValidatorName(
            value,
            template,
            level,
            data?.id,
          );
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
};

export default Index;
export {
  mapping, triggerTypeOptionsData, transformSubmitData, transformLoadData,
};
