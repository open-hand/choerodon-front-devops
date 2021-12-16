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
  }],
});

export default Index;

export { mapping };
