import { DataSet } from 'choerodon-ui/pro';
import { hostdevopsHostsApiConfig } from '@choerodon/master';
import { DataSetProps, FieldProps, FieldType } from '@/interface';

const mapping: {
  [key: string]: FieldProps,
} = {
  repoName: {
    name: 'repoName',
    type: 'string' as FieldType,
    label: '项目镜像仓库',
    required: true,
  },
  imageName: {
    name: 'imageName',
    type: 'string' as FieldType,
    label: '镜像',
    required: true,
  },
  tag: {
    name: 'tag',
    type: 'string' as FieldType,
    label: '镜像版本',
    required: true,
  },
  name: {
    name: 'name',
    type: 'string' as FieldType,
    label: '容器名称',
    required: true,
  },
  value: {
    name: 'value',
    type: 'string' as FieldType,
  },
};

const hostDockerConfigDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => {
    const item = mapping[i];
    return item;
  }),
});

export default hostDockerConfigDataSet;

export { mapping };
