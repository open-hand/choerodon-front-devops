import { DataSet } from 'choerodon-ui/pro';
import { DevopsAlienApiConfig } from '@choerodon/master';

import { checkImage } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/advanced-setting/stores/advancedDataSet';

const mapping: any = {
  CIRunnerImage: {
    name: 'CIRunnerImage',
    type: 'string',
    label: 'CI流程Runner镜像',
    required: true,
    validator: checkImage,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      autoQuery: false,
      transport: {
        read: () => ({
          ...DevopsAlienApiConfig.getDefaultImage(),
          transformResponse: (res) => [{
            text: res,
            value: res,
          }],
        }),
      },
    }),
  },
  versionStrategy: {
    name: 'versionStrategy',
    type: 'boolean',
    label: '版本策略',
    defaultValue: false,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '平台默认',
        value: false,
      }, {
        text: '自定义',
        value: true,
      }],
    }),
  },
  nameRules: {
    name: 'versionNameRules',
    type: 'string',
    label: '版本命名规则',
    disabled: true,
    defaultValue: '${C7N_COMMIT_TIME}-${C7N_BRANCH}',
  },
};

const transformLoadData = (queryData: any) => ({
  [mapping.CIRunnerImage.name]: queryData[0].value,
  [mapping.versionStrategy.name]: false,
  [mapping.nameRules.name]: '${C7N_COMMIT_TIME}-${C7N_BRANCH}',
});

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
  events: {
    create: async ({ dataSet, record }: any) => {
      const res = await record.getField(mapping.CIRunnerImage.name).options.query();
      dataSet.loadData([transformLoadData(res)]);
    },
  },
});

export default Index;

export { mapping };
