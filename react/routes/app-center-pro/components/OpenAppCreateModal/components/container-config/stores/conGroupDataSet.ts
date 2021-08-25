import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps, FieldProps, FieldType } from '@/interface';
import docker from '../images/docker.svg';
import jar from '../images/jar.svg';
import projectproduct from '../images/projectproduct.png';
import marketService from '../images/marketService.png';
import hzero from '../images/hzero.png';
import shareService from '../images/shareService.png';
import custom from '../images/custom.png';

const productTypeData = [{
  value: 'image',
  name: '镜像',
  img: docker,
}, {
  value: 'jar',
  name: 'jar',
  img: jar,
}];

const productSourceData = [{
  value: 'projectProduct',
  name: '项目制品库',
  img: projectproduct,
}, {
  value: 'market',
  name: '市场服务',
  img: marketService,
}, {
  value: 'hzero',
  name: 'HZERO服务',
  img: hzero,
}, {
  value: 'share',
  name: '共享服务',
  img: shareService,
}, {
  value: 'custom',
  name: '自定义仓库',
  img: custom,
}];

const repoTypeData = [{
  value: 'private',
  name: '私有',
}, {
  value: 'public',
  name: '公开',
}];

const mapping: {
  [key: string]: FieldProps
} = {
  name: {
    name: 'name',
    type: 'string' as FieldType,
    defaultValue: 'container-1',
  },
  focus: {
    name: 'focus',
    type: 'boolean' as FieldType,
    defaultValue: false,
  },
  productType: {
    name: 'productType',
    type: 'string' as FieldType,
    defaultValue: productTypeData[0].value,
    options: new DataSet({
      data: productTypeData,
    }),
  },
  productSource: {
    name: 'productSource',
    type: 'string' as FieldType,
    options: new DataSet({
      data: productSourceData,
    }),
    defaultValue: productSourceData[0].value,
  },
  projectImageRepo: {
    name: 'projectImageRepo',
    type: 'string' as FieldType,
    label: '项目镜像仓库',
  },
  image: {
    name: 'image',
    type: 'string' as FieldType,
    label: '镜像',
  },
  imageVersion: {
    name: 'imageVersion',
    type: 'string' as FieldType,
    label: '镜像版本',
  },
  marketAppVersion: {
    name: 'marketAppVersion',
    type: 'string' as FieldType,
    label: '市场应用及版本',
  },
  marketServiceVersion: {
    name: 'marketServiceVersion',
    type: 'string' as FieldType,
    label: '市场服务及版本',
  },
  shareAppService: {
    name: 'shareAppService',
    type: 'string' as FieldType,
    label: '共享应用服务',
  },
  shareServiceVersion: {
    name: 'shareServiceVersion',
    type: 'string' as FieldType,
    label: '服务版本',
  },
  repoAddress: {
    name: 'repoAddress',
    type: 'string' as FieldType,
    label: '仓库地址',
  },
  repoType: {
    name: 'repoType',
    type: 'string' as FieldType,
    label: '仓库类型',
    textField: 'name',
    valueField: 'value',
    defaultValue: repoTypeData[0].value,
    options: new DataSet({
      data: repoTypeData,
    }),
  },
  username: {
    name: 'username',
    type: 'string' as FieldType,
    label: '用户名',
  },
  password: {
    name: 'password',
    type: 'string' as FieldType,
    label: '密码',
  },
  CPUReserved: {
    name: 'CPUReserved',
    type: 'number' as FieldType,
    label: 'CPU预留',
  },
  CPULimit: {
    name: 'CPULimit',
    type: 'number' as FieldType,
    label: 'CPU预留',
  },
  memoryReserved: {
    name: 'memoryReserved',
    type: 'number' as FieldType,
    label: '内存预留',
  },
  memoryLimit: {
    name: 'memoryLimit',
    type: 'number' as FieldType,
    label: '内存上限',
  },
};

const conGroupDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export default conGroupDataSet;

export { mapping, productTypeData, productSourceData };
