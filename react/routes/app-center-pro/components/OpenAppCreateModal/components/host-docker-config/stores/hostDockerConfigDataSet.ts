import { DataSet } from 'choerodon-ui/pro';
import { RdupmAlienApiConfig } from '@choerodon/master';
import { Base64 } from 'js-base64';
import { DataSetProps, FieldProps, FieldType } from '@/interface';

const deployTypeOptionsData = [{
  text: '项目制品库',
  value: 'DEFAULT_REPO',
}, {
  text: '自定义仓库',
  value: 'CUSTOM_REPO',
}];

const repoNameUpdate = (record: any, value: any) => {
  record.getField(mapping.imageName.name).options.setQueryParameter('repoId', value?.repoId);
  record.getField(mapping.imageName.name).options.setQueryParameter('repoType', value?.repoType);
  record.getField(mapping.imageName.name).options.query();
};

const imageNameUpdate = (record: any, value: any) => {
  record.getField(mapping.tag.name).options.setQueryParameter('repoName', `${record.get(mapping.repoName.name)?.repoName}/${value?.imageName}`);
  record.getField(mapping.tag.name).options.query();
};

const mapping: {
  [key: string]: FieldProps,
} = {
  appName: {
    name: 'name',
    type: 'string' as FieldType,
    label: '应用名称',
  },
  appCode: {
    name: 'code',
    type: 'string' as FieldType,
    label: '应用编码',
  },
  deployType: {
    name: 'repoType',
    type: 'string' as FieldType,
    label: 'Docker镜像来源',
    required: true,
    textField: 'text',
    valueField: 'value',
    defaultValue: 'DEFAULT_REPO',
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
    valueField: 'imageName',
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

const hostDockerConfigDataSet = (isDetail: any): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => {
    const item = mapping[i];
    switch (i) {
      case 'appCode': {
        item.dynamicProps = {
          disabled: () => isDetail,
          required: () => isDetail,
        };
        break;
      }
      case 'appName': {
        item.dynamicProps = {
          required: () => isDetail,
        };
        break;
      }
      case 'name':
      case 'imageUrl':
      case 'privateRepository':
      case 'username':
      case 'password':
      case 'deployType': {
        item.dynamicProps = {
          disabled: () => isDetail,
        };
        break;
      }
      case 'repoName': {
        item.dynamicProps = {
          disabled: () => isDetail,
        };
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
        item.dynamicProps = {
          disabled: () => isDetail,
        };
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
    load: ({
      dataSet,
    }: any) => {
      const record = dataSet?.current;
      if (record?.get(mapping.repoName.name)) {
        repoNameUpdate(record, record?.get(mapping.repoName.name));
      }
      if (record?.get(mapping.imageName.name)) {
        imageNameUpdate(record, record?.get(mapping.imageName.name));
      }
    },
    update: ({
      value, name, record, dataSet,
    }:any) => {
      switch (name) {
        case mapping.repoName.name: {
          repoNameUpdate(record, value);
          record?.set(mapping.imageName.name, undefined);
          break;
        }
        case mapping.imageName.name: {
          imageNameUpdate(record, value);
          record?.set(mapping.tag.name, undefined);
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
    repoType: record?.get(mapping.repoName.name)?.repoType,
    [mapping.deployType.name as string]: record?.get(mapping.deployType.name),
    externalImageInfo: {
      [mapping.imageUrl.name as string]: record?.get(mapping.imageUrl.name),
      [mapping.username.name as string]: record?.get(mapping.username.name),
      [mapping.password.name as string]: record?.get(mapping.password.name),
      [mapping.privateRepository.name as string]: record?.get(mapping.privateRepository.name),
    },
    imageInfo: {
      repoId: record?.get(mapping.repoName.name)?.repoId,
      repoName: record?.get(mapping.repoName.name)?.repoName,
      [mapping.imageName.name as string]: record?.get(mapping.imageName.name)?.imageName,
      [mapping.tag.name as string]: record?.get(mapping.tag.name),

    },
  });
};

const transformLoadData = (data: any) => ({
  [mapping.appName.name as string]: data?.[mapping.appName.name as string],
  [mapping.appCode.name as string]: data?.[mapping.appCode.name as string],
  [mapping.deployType.name as string]: data
    ?.devopsDockerInstanceVO?.[mapping.deployType.name as string],
  [mapping.repoName.name as string]: {
    repoId: data?.devopsDockerInstanceVO?.repoId,
    repoName: data?.devopsDockerInstanceVO?.repoName,
    repoType: data?.devopsDockerInstanceVO?.repoType,
  },
  [mapping.imageName.name as string]: {
    imageName: data
      ?.devopsDockerInstanceVO?.[mapping.imageName.name as string],
  },
  [mapping.tag.name as string]: data
    ?.devopsDockerInstanceVO?.[mapping.tag.name as string],
  [mapping.name.name as string]: data
    ?.devopsDockerInstanceVO?.name,
  [mapping.value.name as string]: data
    ?.devopsDockerInstanceVO?.dockerCommand,
});

export default hostDockerConfigDataSet;

export {
  mapping,
  transformSubmitData,
  deployTypeOptionsData,
  transformLoadData,
};
