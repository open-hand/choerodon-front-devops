import { DataSet } from 'choerodon-ui/pro';
import { RdupmAlienApiConfig } from '@choerodon/master';
import { STEPVO, BUILD_DOCKER, BUILD_UPLOADJAR } from '@/routes/app-pipeline/CONSTANTS';
import customRepoConfigDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/customRepoConfigDataSet';

const settingConfigOptionsData = [{
  text: '自定义仓库配置',
  value: 'custom',
}, {
  text: '粘贴XML内容',
  value: 'xml',
}];

const mapping: {
  [key: string]: any
} = {
  expand: {
    name: 'expand',
    type: 'boolean',
    defaultValue: true,
  },
  advancedExpand: {
    name: 'advancedExpand',
    type: 'boolean',
    defaultValue: false,
  },
  settingConfig: {
    name: 'settingConfig',
    type: 'string',
    label: 'Setting配置',
    textField: 'text',
    valueField: 'value',
    required: true,
    defaultValue: 'custom',
    options: new DataSet({
      data: settingConfigOptionsData,
    }),
  },
  script: {
    name: 'script',
    type: 'string',
  },
  name: {
    name: 'name',
    type: 'string',
  },
  type: {
    name: 'type',
    type: 'string',
  },
  stepName: {
    name: 'name',
    type: 'string',
    label: '步骤名称',
    required: true,
  },
  projectRelyRepo: {
    name: 'nexusMavenRepoIds',
    type: 'string',
    label: '项目依赖仓库',
    textField: 'name',
    valueField: 'repositoryId',
    options: new DataSet({
      paging: true,
      autoQuery: true,
      transport: {
        read: () => ({
          ...RdupmAlienApiConfig.getnexusMavenRepoIds(),
        }),
      },
    }),
  },
  dockerFilePath: {
    name: 'dockerFilePath',
    type: 'string',
    label: 'Dockerfile文件路径',
    dynamicProps: {
      required: ({ record }: any) => record.get(mapping.type.name) === BUILD_DOCKER,
    },
  },
  imageContext: {
    name: 'dockerContextDir',
    type: 'string',
    label: '镜像构建上下文',
    dynamicProps: {
      required: ({ record }: any) => record.get(mapping.type.name) === BUILD_DOCKER,
    },
  },
  targetProductsLibrary: {
    name: 'targetProductsLibrary',
    type: 'string',
    label: '目标制品库',
    textField: 'name',
    valueField: 'repositoryId',
    dynamicProps: {
      required: ({ record }: any) => {
        console.log(record.get(mapping.type.name));
        return record.get(mapping.type.name) === BUILD_UPLOADJAR;
      },
    },
    options: new DataSet({
      paging: true,
      autoQuery: true,
      transport: {
        read: () => ({
          ...RdupmAlienApiConfig.getnexusMavenRepoIds('hosted'),
        }),
      },
    }),
  },
  TLS: {
    name: 'skipDockerTlsVerify',
    type: 'boolean',
    label: '是否启用TLS校验',
    textField: 'text',
    valueField: 'value',
    defaultValue: false,
    options: new DataSet({
      data: [{
        text: '是',
        value: true,
      }, {
        text: '否',
        value: false,
      }],
    }),
  },
  imageSafeScan: {
    name: 'imageScan',
    type: 'boolean',
    label: '是否启用镜像安全扫描',
    textField: 'text',
    valueField: 'value',
    defaultValue: false,
    options: new DataSet({
      data: [{
        text: '是',
        value: true,
      }, {
        text: '否',
        value: false,
      }],
    }),
  },
  examType: {
    name: 'examType',
    type: 'string',
    label: '检查类型',
  },
  whetherMavenSingleMeasure: {
    name: 'whetherMavenSingleMeasure',
    type: 'boolean',
    label: '是否执行Maven单测',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '是',
        value: true,
      }, {
        text: '否',
        value: false,
      }],
    }),
  },
  sonarqubeConfigWay: {
    name: 'sonarqubeConfigWay',
    type: 'string',
    label: 'SonarQube配置方式',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '默认配置',
        value: '1',
      }, {
        text: '自定义配置',
        value: '2',
      }],
    }),
  },
  sonarqubeAccountConfig: {
    name: 'sonarqubeAccountConfig',
    type: 'string',
    label: 'SonarQube账号配置',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '用户名与密码',
        value: '1',
      }, {
        text: 'Token',
        value: '2',
      }],
    }),
  },
  username: {
    name: 'username',
    type: 'string',
    label: 'SonarQube用户名',
  },
  password: {
    name: 'password',
    type: 'string',
    label: '密码',
  },
  address: {
    name: 'address',
    type: 'string',
    label: 'SonarQube地址',
  },
  customRepoConfig: {
    name: 'customRepoConfig',
    type: 'object',
    options: new DataSet(customRepoConfigDataSet()),
  },
};

const transformLoadDataItem = (d: any) => ({
  ...d,
  [mapping.expand.name]: true,
  [mapping.settingConfig.name]: settingConfigOptionsData[0].value,
  [mapping.advancedExpand.name]: false,
  ...d[STEPVO[d.type]],
});

const transformLoadData = (data: any) => data && data.map((d: any) => transformLoadDataItem(d));

const transformSubmitData = (ds: any) => ds.records.filter((i: any) => i.status !== 'delete').map((record: any) => ({
  [mapping.name.name]: record?.get(mapping.name.name),
  [mapping.projectRelyRepo.name]: record?.get(mapping.projectRelyRepo.name),
  [mapping.type.name]: record?.get(mapping.type.name),
  [mapping.script.name]: record?.get(mapping.script.name),
}));

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});

export default Index;

export {
  mapping,
  transformLoadData,
  transformSubmitData,
  transformLoadDataItem,
  settingConfigOptionsData,
};
