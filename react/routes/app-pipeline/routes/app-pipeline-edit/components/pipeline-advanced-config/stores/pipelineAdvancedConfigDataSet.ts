import { DataSet } from 'choerodon-ui/pro';
import { DevopsAlienApiConfig } from '@choerodon/master';
import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';

import { checkImage } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/advanced-setting/stores/advancedDataSet';

const versionStrategyData = [{
  text: '平台默认',
  value: false,
}, {
  text: '自定义',
  value: true,
}];

const mapping: any = {
  CIRunnerImage: {
    name: 'image',
    type: 'string',
    label: 'CI流程Runner镜像',
    required: true,
    validator: checkImage,
    textField: 'text',
    valueField: 'value',
    // options: new DataSet({
    //   autoQuery: false,
    //   transport: {
    //     read: () => ({
    //       ...DevopsAlienApiConfig.getDefaultImage(),
    //       transformResponse: (res) => [{
    //         text: res,
    //         value: res,
    //       }],
    //     }),
    //   },
    // }),
  },
  versionStrategy: {
    name: 'versionStrategy',
    type: 'boolean',
    defaultValue: false,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: versionStrategyData,
    }),
  },
  nameRules: {
    name: 'versionNameRules',
    type: 'string',
    label: '版本命名规则',
    disabled: true,
    defaultValue: '${C7N_COMMIT_TIME}-${C7N_BRANCH}',
  },
  versionName: {
    name: 'versionName',
    type: 'string',
    label: '命名规则',
  },
};

const transformLoadData = (queryData?: any, data?: any) => ({
  [mapping.CIRunnerImage.name]: data?.[mapping.CIRunnerImage.name] || (queryData ? queryData[0].value : ''),
  [mapping.versionStrategy.name]: data?.[mapping.versionName.name] ? true
    : (data?.[mapping.versionStrategy.name] || false),
  [mapping.nameRules.name]: data?.[mapping.nameRules.name] || '${C7N_COMMIT_TIME}-${C7N_BRANCH}',
  [mapping.versionName.name]: data?.[mapping.versionName.name] || '',
});

const Index = (data: any, setTabsDataState: any) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    switch (key) {
      case 'CIRunnerImage': {
        const {
          defaultImage,
        } = data;
        item.options = new DataSet({
          data: [{
            text: defaultImage,
            value: defaultImage,
          }],
        });
      }
    }
    return item;
  }),
  events: {
    create: async ({ dataSet, record }: any) => {
      dataSet.loadData([transformLoadData(undefined, data)]);
    },
    update: ({ name, value, record }: any) => {
      switch (name) {
        case mapping.versionStrategy.name: {
          record.set(mapping.versionName.name, undefined);
          break;
        }
        default: {
          break;
        }
      }
      setTabsDataState({
        [TAB_ADVANCE_SETTINGS]: {
          ...data,
          [name]: value,
        },
      });
    },
  },
});

export default Index;

export { mapping, transformLoadData, versionStrategyData };
