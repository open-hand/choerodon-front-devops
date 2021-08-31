import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps, FieldProps, FieldType } from '@/interface';
import docker from '../images/docker.svg';
import jar from '../images/jar.svg';
import projectproduct from '../images/projectproduct.png';
import marketService from '../images/marketService.png';
import hzero from '../images/hzero.png';
import shareService from '../images/shareService.png';
import custom from '../images/custom.png';
import upload from '../images/upload.png';
import portConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/portConfigDataSet';
import optionDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config/stores/optionsDataSet';
import { rdupmApiApiConfig } from '@/api/Rdupm';
import { deployApiConfig } from '@/api';
import { appServiceApiConfig } from '@/api/AppService';
import { appServiceVersionApiConfig } from '@/api/AppServiceVersions';
import { nexusApiConfig } from '@/api/Nexus';
import { devopsDeployGroupApiConfig } from '@/api/DevopsDeployGroup';
import { setReturnData } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/content';

const productTypeData = [{
  value: 'docker',
  name: '镜像',
  img: docker,
}, {
  value: 'jar',
  name: 'jar',
  img: jar,
}];

const productSourceData = [{
  value: 'currentProject',
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
}, {
  value: 'upload',
  name: '本地上传',
  img: upload,
}];

const repoTypeData = [{
  value: true,
  name: '私有',
}, {
  value: false,
  name: '公开',
}];

const mapping: {
  [key: string]: FieldProps
} = {
  edit: {
    name: 'edit',
    type: 'boolean' as FieldType,
    defaultValue: false,
  },
  name: {
    name: 'name',
    type: 'string' as FieldType,
    defaultValue: 'container-1',
    required: true,
  },
  focus: {
    name: 'focus',
    type: 'boolean' as FieldType,
    defaultValue: false,
  },
  productType: {
    name: 'type',
    type: 'string' as FieldType,
    defaultValue: productTypeData[0].value,
    options: new DataSet({
      data: productTypeData,
    }),
  },
  productSource: {
    name: 'sourceType',
    type: 'string' as FieldType,
    options: new DataSet({
      data: productSourceData,
    }),
    defaultValue: productSourceData[0].value,
  },
  projectImageRepo: {
    name: 'projectImageRepo',
    type: 'object' as FieldType,
    label: '项目镜像仓库',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[0].value,
    },
    textField: 'repoName',
    valueField: 'repoId',
    lookupAxiosConfig: () => rdupmApiApiConfig.getProjectImageRepo(),
  },
  image: {
    name: 'imageName',
    type: 'object' as FieldType,
    label: '镜像',
    textField: 'imageName',
    valueField: 'imageName',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[0].value,
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.projectImageRepo.name)) {
          return rdupmApiApiConfig.getImages(record?.get(mapping.projectImageRepo.name).repoId, 'DEFAULT_REPO');
        }
        return undefined;
      },
    },
  },
  imageVersion: {
    name: 'tag',
    type: 'string' as FieldType,
    label: '镜像版本',
    textField: 'tagName',
    valueField: 'tagName',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && [
          productSourceData[0].value,
          productSourceData[4].value,
        ].includes(record?.get(
          mapping.productSource.name,
        )),
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.projectImageRepo.name) && record?.get(mapping.image.name)) {
          return rdupmApiApiConfig.getImageVersion(
            record?.get(mapping.projectImageRepo.name).repoName,
            record?.get(mapping.image.name).imageName || record?.get(mapping.image.name),
          );
        }
        return undefined;
      },
    },
  },
  marketAppVersion: {
    name: 'marketAppVersion',
    type: 'string' as FieldType,
    label: '市场应用及版本',
    dynamicProps: {
      required: ({ record }) => [
        productSourceData[1].value,
        productSourceData[2].value,
      ].includes(record?.get(
        mapping.productSource.name,
      )),
    },
    textField: 'versionNumber',
    valueField: 'id',
    options: new DataSet({
      autoQuery: true,
      fields: [{ name: 'groupName', type: 'string' as FieldType, group: 0 }],
      transport: {
        read: ({ data: paramsData }) => ({
          ...deployApiConfig.deployApplication(paramsData?.type || 'common'),
          transformResponse: (res) => {
            function init(data: any) {
              const result: any[] = [];
              data.forEach((item: any) => {
                item.appVersionVOS.forEach((version: any) => {
                  result.push({
                    ...version,
                    groupName: item.name,
                  });
                });
              });
              return result;
            }
            let newRes = res;
            try {
              newRes = JSON.parse(newRes);
              return init(newRes);
            } catch (e) {
              return init(newRes);
            }
          },
        }),
      },
    }),
  },
  marketServiceVersion: {
    name: 'marketServiceVersion',
    type: 'object' as FieldType,
    label: '市场服务及版本',
    textField: 'marketServiceName',
    valueField: 'id',
    dynamicProps: {
      required: ({ record }) => [
        productSourceData[1].value,
        productSourceData[2].value,
      ].includes(record?.get(
        mapping.productSource.name,
      )),
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.marketAppVersion.name)) {
          return ({
            ...deployApiConfig.deployVersion(record?.get(mapping.marketAppVersion.name), 'image'),
            transformResponse: (res: any) => {
              function init(dt: any) {
                return dt.map((d: any) => {
                  const newD = d;
                  newD.id = newD.marketServiceDeployObjectVO.id;
                  return d;
                });
              }
              let newRes = res;
              try {
                newRes = JSON.parse(res);
                return init(newRes);
              } catch (e) {
                return init(newRes);
              }
            },
          });
        }
        return undefined;
      },
    },
  },
  shareAppService: {
    name: 'appServiceId',
    type: 'string' as FieldType,
    label: '共享应用服务',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[3].value,
    },
    textField: 'name',
    valueField: 'id',
    options: new DataSet({
      autoQuery: true,
      fields: [{ name: 'groupName', type: 'string' as FieldType, group: 0 }],
      transport: {
        read: () => ({
          ...appServiceApiConfig.getAppService(true, 'normal', 'share_service'),
          transformResponse: (res) => {
            function init(data: any) {
              const result: any[] = [];
              data.forEach((item: any) => {
                item.appServiceList.forEach((version: any) => {
                  result.push({
                    ...version,
                    groupName: item.name,
                  });
                });
              });
              return result;
            }
            let newRes = res;
            try {
              newRes = JSON.parse(newRes);
              return init(newRes);
            } catch (e) {
              return init(newRes);
            }
          },
        }),
      },
    }),
  },
  shareServiceVersion: {
    name: 'appServiceVersionId',
    type: 'string' as FieldType,
    label: '服务版本',
    textField: 'version',
    valueField: 'id',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[3].value,
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.shareAppService.name)) {
          return appServiceVersionApiConfig.getVersions(
            record?.get(mapping.shareAppService.name),
            true,
            true,
          );
        }
        return undefined;
      },
    },

  },
  repoAddress: {
    name: 'customImageName',
    type: 'string' as FieldType,
    label: '仓库地址',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[4].value,
    },
  },
  repoType: {
    name: 'privateRepository',
    type: 'boolean' as FieldType,
    label: '仓库类型',
    textField: 'name',
    valueField: 'value',
    defaultValue: repoTypeData[0].value,
    options: new DataSet({
      data: repoTypeData,
    }),
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[4].value,
    },
  },
  username: {
    name: 'username',
    type: 'string' as FieldType,
    label: '用户名',
    required: true,
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[4].value,
    },
  },
  password: {
    name: 'password',
    type: 'string' as FieldType,
    label: '密码',
    required: true,
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[4].value,
    },
  },
  nexus: {
    name: 'nexusId',
    type: 'string' as FieldType,
    label: 'Nexus服务',
    textField: 'serverName',
    valueField: 'configId',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[1].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[0].value,
    },
    lookupAxiosConfig: () => nexusApiConfig.getServerList(),
  },
  projectProductRepo: {
    name: 'repositoryId',
    type: 'object' as FieldType,
    label: '项目制品库',
    textField: 'neRepositoryName',
    valueField: 'repositoryId',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[1].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[0].value,
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.nexus.name)) {
          return rdupmApiApiConfig.getMavenList(record?.get(mapping.nexus.name));
        }
        return undefined;
      },
    },
  },
  groupId: {
    name: 'groupId',
    type: 'string' as FieldType,
    label: 'groupId',
    textField: 'name',
    valueField: 'value',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[1].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[0].value,
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.projectProductRepo.name)) {
          return ({
            ...rdupmApiApiConfig.getGroupId(
              record?.get(mapping.projectProductRepo.name).repositoryId,
            ),
            transformResponse: (res) => {
              function init(data: any) {
                return data.map((i: string) => ({
                  name: i,
                  value: i,
                }));
              }
              let newRes = res;
              try {
                newRes = JSON.parse(res);
                return init(newRes);
              } catch (e) {
                return init(newRes);
              }
            },
          });
        }
        return undefined;
      },
    },
  },
  artifactId: {
    name: 'artifactId',
    type: 'string' as FieldType,
    label: 'artifactId',
    textField: 'name',
    valueField: 'value',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[1].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[0].value,
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.projectProductRepo.name)) {
          return ({
            ...rdupmApiApiConfig.getArtifactId(
              record?.get(mapping.projectProductRepo.name).repositoryId,
            ),
            transformResponse: (res) => {
              function init(data: any) {
                return data.map((i: string) => ({
                  name: i,
                  value: i,
                }));
              }
              let newRes = res;
              try {
                newRes = JSON.parse(res);
                return init(newRes);
              } catch (e) {
                return init(newRes);
              }
            },
          });
        }
        return undefined;
      },
    },
  },
  jarVersion: {
    name: 'version',
    type: 'string' as FieldType,
    label: 'jar包版本',
    textField: 'version',
    valueField: 'version',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[1].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[0].value,
      lookupAxiosConfig: ({ record }) => {
        if (
          record?.get(mapping.projectProductRepo.name)
          && record?.get(mapping.groupId.name)
          && record?.get(mapping.artifactId.name)
        ) {
          return ({
            ...rdupmApiApiConfig.getJarVersion({
              artifactId: record?.get(mapping.artifactId.name),
              groupId: record?.get(mapping.groupId.name),
              repositoryId: record?.get(mapping.projectProductRepo.name).repositoryId,
              repositoryName: record?.get(mapping.projectProductRepo.name).neRepositoryName,
            }),
          });
        }
        return undefined;
      },
    },
  },
  CPUReserved: {
    name: 'requestCpu',
    type: 'number' as FieldType,
    label: 'CPU预留',
  },
  CPULimit: {
    name: 'limitCpu',
    type: 'number' as FieldType,
    label: 'CPU上限',
  },
  memoryReserved: {
    name: 'requestMemory',
    type: 'number' as FieldType,
    label: '内存预留',
  },
  memoryLimit: {
    name: 'limitMemory',
    type: 'number' as FieldType,
    label: '内存上限',
  },
  portConfig: {
    name: 'portConfig',
    type: 'object' as FieldType,
    options: new DataSet(portConfigDataSet()),
  },
  enVariable: {
    name: 'enVariable',
    type: 'object' as FieldType,
    options: new DataSet(optionDataSet(/[-._a-zA-Z][-._a-zA-Z0-9]*/)),
  },
  fileName: {
    name: 'fileName',
    type: 'string' as FieldType,
  },
  jarFileDownloadUrl: {
    name: 'jarFileUrl',
    type: 'string' as FieldType,
  },
};

const conGroupDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
  transport: {
    update: (data) => devopsDeployGroupApiConfig
      .updateContainer((data?.dataSet?.queryParameter as any)?.data),
  },
  events: {
    update: ({ record, name, value }: any) => {
      switch (name) {
        case mapping.productType.name: {
          record.set(mapping.productSource.name, productSourceData[0].value);
          break;
        }
        case mapping.productSource.name: {
          record.set(mapping.marketAppVersion.name, '');
          record.set(mapping.marketServiceVersion.name, '');
          switch (value) {
            case productSourceData[1].value: {
              const optionsDs = record?.getField(mapping.marketAppVersion.name).options;
              optionsDs.setQueryParameter('type', 'common');
              optionsDs.query();
              break;
            }
            case productSourceData[2].value: {
              const optionsDs = record?.getField(mapping.marketAppVersion.name).options;
              optionsDs.setQueryParameter('type', 'hzero');
              optionsDs.query();
              break;
            }
            default: {
              break;
            }
          }
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});

export default conGroupDataSet;

export {
  mapping, productTypeData, productSourceData,
};
