import {
  devopsDockerComposeApiConfig,
} from '@choerodon/master';

const mapping: any = {
  containerName: {
    name: 'name',
    type: 'string',
    label: '容器名称',
  },
  image: {
    name: 'image',
    type: 'string',
    label: '镜像',
  },
  port: {
    name: 'ports',
    type: 'string',
    label: '占用端口',
  },
  status: {
    name: 'status',
    type: 'string',
    label: '状态',
  },
};

const Index = (id: any): any => ({
  selection: false,
  autoQuery: true,
  transport: {
    read: ({
      ...devopsDockerComposeApiConfig.getContainerList(id),
    }),
  },
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    return item;
  }),
});

export default Index;

export {
  mapping,
};
