import { DataSet } from 'choerodon-ui/pro';
import { RdupmAlienApiConfig } from '@choerodon/master';
import { Base64 } from 'js-base64';
import { DataSetProps, FieldProps, FieldType } from '@/interface';

const mapping: {
  [key: string]: FieldProps,
} = {
  repoName: {
    name: 'repoName',
    type: 'object' as FieldType,
    label: '项目镜像仓库',
    required: true,
    textField: 'repoName',
    valueField: 'repoId',
  },
  imageName: {
    name: 'imageName',
    type: 'object' as FieldType,
    label: '镜像',
    required: true,
    textField: 'imageName',
    valueField: 'imageId',
  },
  tag: {
    name: 'tag',
    type: 'string' as FieldType,
    label: '镜像版本',
    required: true,
    textField: 'tagName',
    valueField: 'tagName',
  },
  name: {
    name: 'containerName',
    type: 'string' as FieldType,
    label: '容器名称',
    required: true,
  },
  value: {
    name: 'value',
    type: 'string' as FieldType,
    defaultValue: 'docker run --name=${containerName} -d ${imageName}',
  },
};

const hostDockerConfigDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => {
    const item = mapping[i];
    switch (i) {
      case 'repoName': {
        item.options = new DataSet({
          autoQuery: true,
          transport: {
            read: () => ({
              ...RdupmAlienApiConfig.getImageRepoList(),
            }),
          },
        });
        break;
      }
      case 'imageName': {
        item.options = new DataSet({
          autoQuery: false,
          transport: {
            read: ({ data }) => ({
              ...RdupmAlienApiConfig.getImageHarbor(data?.repoId, data?.repoType),
            }),
          },
        });
        break;
      }
      case 'tag': {
        item.options = new DataSet({
          autoQuery: false,
          transport: {
            read: ({ data }) => ({
              ...RdupmAlienApiConfig.getImageTag(data?.repoName),
            }),
          },
        });
      }
    }
    return item;
  }),
  events: {
    update: ({
      value, name, record, dataSet,
    }:any) => {
      switch (name) {
        case mapping.repoName.name: {
          record.getField(mapping.imageName.name).options.setQueryParameter('repoId', value?.repoId);
          record.getField(mapping.imageName.name).options.setQueryParameter('repoType', value?.repoType);
          record.getField(mapping.imageName.name).options.query();
          break;
        }
        case mapping.imageName.name: {
          console.log(value, record.get(mapping.repoName.name));
          record.getField(mapping.tag.name).options.setQueryParameter('repoName', `${record.get(mapping.repoName.name)?.repoName}/${value?.imageName}`);
          record.getField(mapping.tag.name).options.query();
          break;
        }
      }
    },
  },
});

const transformSubmitData = (ds: any) => {
  const record = ds?.current;
  return ({
    [mapping.name.name as string]: record?.get(mapping.name.name),
    [mapping.value.name as string]: Base64.encode(record?.get(mapping.value.name)),
    sourceType: 'currentProject',
    imageInfo: {
      repoType: record?.get(mapping.repoName.name)?.repoType,
      repoId: record?.get(mapping.repoName.name)?.repoId,
      repoName: record?.get(mapping.repoName.name)?.repoName,
      [mapping.imageName.name as string]: record?.get(mapping.imageName.name)?.imageName,
      [mapping.tag.name as string]: record?.get(mapping.tag.name),
    },
  });
};

export default hostDockerConfigDataSet;

export {
  mapping,
  transformSubmitData,
};
