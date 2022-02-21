import { DataSet } from 'choerodon-ui/pro';
import { RdupmAlienApiConfig } from '@choerodon/master';
import { Base64 } from 'js-base64';
import { DataSetProps, FieldProps, FieldType } from '@/interface';

const deployTypeOptionsData = [{
  text: '项目制品库',
  value: 'default',
}, {
  text: '自定义仓库',
  value: 'custom',
}];

const mapping: {
  [key: string]: FieldProps,
} = {
  deployType: {
    name: 'deployType',
    type: 'string' as FieldType,
    label: 'Docker镜像来源',
    required: true,
    textField: 'text',
    valueField: 'value',
    defaultValue: 'default',
    options: new DataSet({
      data: deployTypeOptionsData,
    }),
  },
  repoName: {
    name: 'repoName',
    type: 'object' as FieldType,
    label: '项目镜像仓库',
    dynamicProps: {
      required: ({ record }) => record
        .get(mapping.deployType.name) === deployTypeOptionsData[0].value,
    },
    textField: 'repoName',
    valueField: 'repoId',
  },
  imageName: {
    name: 'imageName',
    type: 'object' as FieldType,
    label: '镜像',
    dynamicProps: {
      required: ({ record }) => record
        .get(mapping.deployType.name) === deployTypeOptionsData[0].value,
    },
    textField: 'imageName',
    valueField: 'imageId',
  },
  tag: {
    name: 'tag',
    type: 'string' as FieldType,
    label: '镜像版本',
    dynamicProps: {
      required: ({ record }) => record
        .get(mapping.deployType.name) === deployTypeOptionsData[0].value,
    },
    textField: 'tagName',
    valueField: 'tagName',
  },
  name: {
    name: 'containerName',
    type: 'string' as FieldType,
    label: '容器名称',
    required: true,
    maxLength: 64,
  },
  value: {
    name: 'value',
    type: 'string' as FieldType,
    defaultValue: 'docker run --name=${containerName} -d ${imageName}',
  },
  imageUrl: {
    name: 'imageUrl',
    type: 'string' as FieldType,
    label: '镜像地址',
    dynamicProps: {
      required: ({ record }) => record
        .get(mapping.deployType.name) === deployTypeOptionsData[1].value,
    },
  },
  privateRepository: {
    name: 'privateRepository',
    type: 'boolean' as FieldType,
    label: '仓库类型',
    dynamicProps: {
      required: ({ record }) => record
        .get(mapping.deployType.name) === deployTypeOptionsData[1].value,
    },
    defaultValue: true,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        value: true,
        text: '私有',
      }, {
        value: false,
        text: '共有',
      }],
    }),
  },
  username: {
    name: 'username',
    type: 'string' as FieldType,
    label: '用户名',
    dynamicProps: {
      required: ({ record }) => (record
        .get(mapping.deployType.name) === deployTypeOptionsData[1].value) && (
        record.get(mapping.privateRepository.name)
      ),
    },
  },
  password: {
    name: 'password',
    type: 'string' as FieldType,
    label: '密码',
    dynamicProps: {
      required: ({ record }) => (record
        .get(mapping.deployType.name) === deployTypeOptionsData[1].value) && (
        record.get(mapping.privateRepository.name)
      ),
    },
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
    [mapping.deployType.name as string]: record?.get(mapping.deployType.name),
    externalImageInfo: {
      [mapping.imageUrl.name as string]: record?.get(mapping.imageUrl.name),
      [mapping.username.name as string]: record?.get(mapping.username.name),
      [mapping.password.name as string]: record?.get(mapping.password.name),
      [mapping.privateRepository.name as string]: record?.get(mapping.privateRepository.name),
    },
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
  deployTypeOptionsData,
};
