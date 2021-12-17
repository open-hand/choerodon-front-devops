import { DataSet } from 'choerodon-ui/pro';

const mapping: any = {
  CIRunnerImage: {
    name: 'CIRunnerImage',
    type: 'string',
    label: 'CI流程Runner镜像',
  },
  versionStrategy: {
    name: 'versionStrategy',
    type: 'string',
    label: '版本策略',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '平台默认',
        value: '1',
      }, {
        text: '自定义',
        value: '2',
      }],
    }),
  },
  nameRules: {
    name: 'nameRules',
    type: 'string',
    label: '版本命名规则',
  },
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});

export default Index;

export { mapping };
