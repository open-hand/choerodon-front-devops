import { DataSet } from 'choerodon-ui/pro';

const mapping: {
  [key: string]: any
} = {
  expand: {
    name: 'expand',
    type: 'boolean',
    defaultValue: true,
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
    name: 'stepName',
    type: 'string',
    label: '步骤名称',
  },
  projectRelyRepo: {
    name: 'projectRelyRepo',
    type: 'string',
    label: '项目依赖仓库',
  },
  dockerFilePath: {
    name: 'dockerFilePath',
    type: 'string',
    label: 'Dockerfile文件路径',
  },
  imageContext: {
    name: 'imageContext',
    type: 'string',
    label: '镜像构建上下文',
  },
  targetProductsLibrary: {
    name: 'targetProductsLibrary',
    type: 'string',
    label: '目标制品库',
  },
  TLS: {
    name: 'TLS',
    type: 'boolean',
    label: '是否启用TLS校验',
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
  imageSafeScan: {
    name: 'imageSafeScan',
    type: 'boolean',
    label: '是否启用镜像安全扫描',
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
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
  data: [{
    name: 'Maven构建',
    type: 'maven',
    expand: true,
  }, {
    name: 'NPM构建',
    type: 'npm',
    expand: true,
  }, {
    name: 'Docker构建',
    type: 'docker',
    expand: true,
  }, {
    name: '上传Jar包至制品库',
    type: 'upload_jar',
    expand: true,
  }, {
    name: 'Go构建',
    type: 'go',
    expand: true,
  }, {
    name: 'Maven发布',
    type: 'maven_publish',
    expand: true,
  }, {
    name: 'SonarQube代码检查',
    type: 'SonarQube',
    expand: true,
  }, {
    name: '上传Chart至猪齿鱼',
    type: 'upload_chart_choerodon',
    expand: true,
  }],
});

export default Index;

export { mapping };
