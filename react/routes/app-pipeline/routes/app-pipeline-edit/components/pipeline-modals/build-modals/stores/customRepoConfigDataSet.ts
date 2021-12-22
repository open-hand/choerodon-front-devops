import { DataSet } from 'choerodon-ui/pro';

const typeData = [{
  text: '公有',
  value: 'public',
}, {
  text: '私有',
  value: 'private',
}];

const mapping: any = {
  repoName: {
    name: 'repoName',
    type: 'string',
    label: '仓库名称',
  },
  repoType: {
    name: 'repoType',
    type: 'string',
    label: '仓库类型',
    textField: 'text',
    valueField: 'value',
    multiple: true,
    options: new DataSet({
      data: [{
        text: 'snapshot仓库',
        value: 'snapshot',
      }, {
        text: 'release仓库',
        value: 'release',
      }],
    }),
  },
  repoAddress: {
    name: 'repoAddress',
    type: 'string',
    label: '仓库地址',
  },
  username: {
    name: 'username',
    type: 'string',
    label: '用户名',
  },
  password: {
    name: 'password',
    type: 'string',
    label: '密码',
  },
  type: {
    name: 'type',
    type: 'string',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: typeData,
    }),
  },
};

const Index = () => ({
  autoCreate: false,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});

export default Index;

export { mapping, typeData };
