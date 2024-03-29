/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
/* eslint-disable */
import { DataSet } from 'choerodon-ui/pro';
import { marketServiceVersionOptionDs } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/stores/appConfigDataSet';
import {
  DataSetProps, FieldProps, FieldType, Record, DataToJSON,
} from '@/interface';
import docker from '../images/docker.svg';
import jar from '../images/jar.svg';
import projectproduct from '../images/projectproduct.png';
import marketService from '../images/marketService.png';
import hzero from '../images/hzero.png';
import shareService from '../images/shareService.png';
import custom from '../images/custom.png';
import upload from '../images/upload.png';
import customRepo from '../images/customRepo.svg';
import portConfigDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/portConfigDataSet';
import optionDataSet
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config/stores/optionsDataSet';
import { rdupmApiApiConfig } from '@/api/Rdupm';
import { deployApiConfig, uniqueApiConfig } from '@/api';
import { appServiceApiConfig } from '@/api/AppService';
import { appServiceVersionApiConfig } from '@/api/AppServiceVersions';
import { nexusApiConfig } from '@/api/Nexus';
import { devopsDeployGroupApiConfig } from '@/api/DevopsDeployGroup';
import { setReturnData } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/content';
import { OPTIONAL } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config/constant';
import { BUILD_DOCKER, BUILD_MAVEN_PUBLISH, BUILD_UPLOADJAR } from '@/routes/app-pipeline/CONSTANTS';

const hasMarketService = !window._env_.NON_INSTALL_MARKET;

const checkReserved = async (
  value: string,
  record: Record,
  limitName: string,
  isLimit: boolean = false,
) => {
  if (value) {
    if (record.get(limitName)) {
      if (isLimit) {
        if (Number(value) < Number(record.get(limitName))) {
          return '预留不可大于上线';
        }
        return true;
      }
      if (Number(value) > Number(record.get(limitName))) {
        return '预留不可大于上线';
      }
      return true;
    }
    return true;
  }
  return true;
};

const marketServiceVersionDataSet = new DataSet(marketServiceVersionOptionDs);

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
  name: '自定义镜像',
  img: custom,
}, {
  value: 'upload',
  name: '本地上传',
  img: upload,
}, {
  value: 'pipeline',
  name: '流水线上游制品',
  img: projectproduct,
}, {
  value: 'middleware',
  name: '中间件',
}, {
  value: 'custom_jar',
  name: '自定义仓库',
  img: customRepo,
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
  open: {
    name: 'open',
    type: 'boolean' as FieldType,
    defaultValue: true,
  },
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
    label: 'Tag',
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
    dynamicProps: {
      label: ({ record }) => {
        if (record.get(mapping.productSource.name) === productSourceData[1].value) {
          return '市场应用及版本';
        }
        return 'Hzero应用及版本';
      },
      required: ({ record }) => [
        productSourceData[1].value,
        productSourceData[2].value,
      ].includes(record?.get(
        mapping.productSource.name,
      )),
    },
    textField: 'versionNumber',
    valueField: 'id',
  },
  marketServiceVersion: {
    name: 'marketServiceVersion',
    type: 'object' as FieldType,
    label: '市场服务及版本',
    textField: 'marketServiceName',
    valueField: 'id',
    dynamicProps: {
      label: ({ record }) => {
        if (record.get(mapping.productSource.name) === productSourceData[1].value) {
          return '市场服务及版本';
        }
        return 'Hzero服务及版本';
      },
      required: ({ record }) => [
        productSourceData[1].value,
        productSourceData[2].value,
      ].includes(record?.get(
        mapping.productSource.name,
      )),
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
  },
  shareServiceVersion: {
    name: 'appServiceVersionId',
    type: 'string' as FieldType,
    label: '服务版本',
    textField: 'version',
    valueField: 'id',

  },
  repoAddress: {
    name: 'customImageName',
    type: 'string' as FieldType,
    label: '镜像地址',
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
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[4].value
        && record.get(mapping.repoType.name) === repoTypeData[0].value,
    },
  },
  password: {
    name: 'password',
    type: 'string' as FieldType,
    label: '密码',
    dynamicProps: {
      required: ({ record }) => record?.get(mapping.productType.name) === productTypeData[0].value
        && record?.get(
          mapping.productSource.name,
        ) === productSourceData[4].value
        && record.get(mapping.repoType.name) === repoTypeData[0].value,
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
  },
  projectProductRepo: {
    name: 'repositoryId',
    type: 'object' as FieldType,
    label: '项目制品库',
    textField: 'neRepositoryName',
    valueField: 'repositoryId',
  },
  groupId: {
    name: 'groupId',
    type: 'string' as FieldType,
    label: 'groupId',
    textField: 'name',
    valueField: 'value',
  },
  artifactId: {
    name: 'artifactId',
    type: 'string' as FieldType,
    label: 'artifactId',
    textField: 'name',
    valueField: 'value',

  },
  jarVersion: {
    name: 'version',
    type: 'string' as FieldType,
    label: 'jar包版本',
    textField: 'version',
    valueField: 'version',
  },
  CPUReserved: {
    name: 'requestCpu',
    type: 'number' as FieldType,
    label: 'CPU预留',
    validator: (
      value: string,
      name: string,
      record: Record,
    ) => checkReserved(value, record, mapping.CPULimit.name as string),
  },
  CPULimit: {
    name: 'limitCpu',
    type: 'number' as FieldType,
    label: 'CPU上限',
    validator: (
      value: string,
      name: string,
      record: Record,
    ) => checkReserved(value, record, mapping.CPUReserved.name as string, true),
  },
  memoryReserved: {
    name: 'requestMemory',
    type: 'number' as FieldType,
    label: '内存预留',
    validator: (
      value: string,
      name: string,
      record: Record,
    ) => checkReserved(value, record, mapping.memoryLimit.name as string),
  },
  memoryLimit: {
    name: 'limitMemory',
    type: 'number' as FieldType,
    label: '内存上限',
    validator: (
      value: string,
      name: string,
      record: Record,
    ) => checkReserved(value, record, mapping.memoryReserved.name as string, true),
  },
  portConfig: {
    name: 'portConfig',
    type: 'object' as FieldType,
  },
  enVariable: {
    name: 'enVariable',
    type: 'object' as FieldType,
  },
  fileName: {
    name: 'fileName',
    type: 'string' as FieldType,
  },
  jarFileDownloadUrl: {
    name: 'jarFileUrl',
    type: 'string' as FieldType,
  },
  relativeMission: {
    textField: 'name',
    valueField: 'name',
    name: 'pipelineJobName',
    type: 'string' as FieldType,
    label: '关联构建任务',
  },
};

const conGroupDataSet = (
  isPipeline?: Boolean,
  preJobList?: {
    metadata: string,
    name: string,
  }[],
): DataSetProps => {
  let dockerData: any[] = [];
  let jarData: any[] = [];
  if (preJobList && preJobList.length > 0) {
    dockerData = preJobList
      .filter((itemList: any) => itemList?.devopsCiStepVOList
        ?.some((c: any) => c.type === BUILD_DOCKER));
    jarData = preJobList
      .filter((itemList: any) => itemList?.devopsCiStepVOList
        ?.some((c: any) => [BUILD_MAVEN_PUBLISH, BUILD_UPLOADJAR].includes(c?.type)));
  }
  return ({
    dataToJSON: 'all' as DataToJSON,
    autoCreate: true,
    fields: Object.keys(mapping).map((i) => {
      const item = mapping[i];
      switch (i) {
        case 'productSource': {
          if (isPipeline) {
            item.defaultValue = productSourceData[6].value;
          } else {
            item.defaultValue = productSourceData[0].value;
          }
          break;
        }
        case 'relativeMission': {
          if (preJobList && preJobList.length > 0) {
            item.options = new DataSet({
              data: dockerData,
            });
            if (dockerData && dockerData.length === 1) {
              item.defaultValue = dockerData[0].name;
            }
            if (isPipeline) {
              item.required = true;
            }
          }
          break;
        }
        case 'enVariable': {
          item.options = new DataSet(optionDataSet(/[-._a-zA-Z][-._a-zA-Z0-9]*/));
          break;
        }
        case 'marketAppVersion': {
          if (hasMarketService) {
            item.options = new DataSet({
              autoQuery: false,
              fields: [{ name: 'groupName', type: 'string' as FieldType, group: 0 }],
              transport: {
                read: ({ data: paramsData }) => ({
                  ...deployApiConfig.deployApplication(paramsData?.type || 'common'),
                  transformResponse: (res) => {
                    function init(data: any) {
                      let result: any[] = [];
                      // eslint-disable-next-line no-shadow
                      data?.forEach((i: {
                        name: string,
                        appVersionVOS: {
                          id: string
                        }[]
                      }) => {
                        const iData = i.appVersionVOS.map((app: {
                          id: string,
                        }) => ({
                          ...app,
                          name: i.name,
                          // 如果没有分类 则是选配
                          id: i.name ? app.id : 'optional',
                        }));
                        result = [
                          ...result,
                          ...iData,
                        ];
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
            });
          }
        }
        case 'shareAppService': {
          item.options = new DataSet({
            autoQuery: true,
            fields: [{ name: 'groupName', type: 'string' as FieldType, group: 0 }],
            transport: {
              read: () => ({
                ...appServiceApiConfig.getAppService(true, 'normal', 'share_service'),
                transformResponse: (res) => {
                  function init(data: any) {
                    const result: any[] = [];
                    data?.forEach((j: any) => {
                      j.appServiceList?.forEach((version: any) => {
                        result.push({
                          ...version,
                          groupName: j.name,
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
          });
        }
        case 'marketServiceVersion': {
          item.options = marketServiceVersionDataSet;
          break;
        }
        case 'shareServiceVersion': {
          item.dynamicProps = {
            required: ({ record }) => record?.get(
              mapping.productType.name,
            ) === productTypeData[0].value
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
          };
          break;
        }
        case 'nexus': {
          item.lookupAxiosConfig = () => nexusApiConfig.getServerList();
          break;
        }
        case 'projectProductRepo': {
          item.dynamicProps = {
            required: ({ record }) => record?.get(
              mapping.productType.name,
            ) === productTypeData[1].value
              && record?.get(
                mapping.productSource.name,
              ) === productSourceData[0].value,
            lookupAxiosConfig: ({ record }) => {
              if (record?.get(mapping.nexus.name)) {
                return rdupmApiApiConfig.getMavenList(record?.get(mapping.nexus.name));
              }
              return undefined;
            },
          };
          break;
        }
        case 'groupId': {
          item.dynamicProps = {
            required: ({ record }) => record?.get(
              mapping.productType.name,
            ) === productTypeData[1].value
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
                      return data.map((j: any) => {
                        if (typeof i === 'string') {
                          return ({
                            name: j,
                            value: j,
                          });
                        }
                        return j;
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
          };
          break;
        }
        case 'artifactId': {
          item.dynamicProps = {
            required: ({ record }) => record?.get(
              mapping.productType.name,
            ) === productTypeData[1].value
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
                      return data.map((j: any) => {
                        if (typeof i === 'string') {
                          return ({
                            name: j,
                            value: j,
                          });
                        }
                        return j;
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
          };
          break;
        }
        case 'jarVersion': {
          item.dynamicProps = {
            required: ({ record }) => record?.get(
              mapping.productType.name,
            ) === productTypeData[1].value
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
          };
          break;
        }
        case 'portConfig': {
          item.options = new DataSet(portConfigDataSet());
          break;
        }
        default: {
          break;
        }
      }
      return item;
    }),
    transport: {
      update: (data) => devopsDeployGroupApiConfig
        .updateContainer((data?.dataSet?.queryParameter as any)?.data),
    },
    events: {
      create: ({ record }: any) => {
        record.getField(mapping.enVariable.name).set('options', new DataSet(optionDataSet(/[-._a-zA-Z][-._a-zA-Z0-9]*/)));
        record.getField(mapping.portConfig.name).set('options', new DataSet(portConfigDataSet()));
      },
      update: ({
        record, name, value, dataSet,
      }: any) => {
        switch (name) {
          case mapping.artifactId.name: {
            record.set(mapping.jarVersion.name, undefined);
            break;
          }
          case mapping.groupId.name: {
            record.set(mapping.artifactId.name, undefined);
            break;
          }
          case mapping.shareAppService.name: {
            record.set(mapping.shareServiceVersion.name, undefined);
            break;
          }
          case mapping.productType.name: {
            if (isPipeline) {
              record.set(mapping.productSource.name, productSourceData[6].value);
              if (value === productTypeData[0].value) {
                record.getField(mapping.relativeMission.name).options.loadData(dockerData);
              } else {
                record.getField(mapping.relativeMission.name).options.loadData(jarData);
              }
              record.set(mapping.relativeMission.name, undefined);
              if (record.get(mapping.productSource.name) === productSourceData[6].value) {
                record.getField(mapping.relativeMission.name).set('required', true);
              } else {
                record.getField(mapping.relativeMission.name).set('required', false);
              }
            } else {
              record.set(mapping.productSource.name, productSourceData[0].value);
            }
            break;
          }
          case mapping.productSource.name: {
            record.set(mapping.marketAppVersion.name, undefined);
            record.set(mapping.marketServiceVersion.name, undefined);
            record.set(mapping.imageVersion.name, undefined);
            record.set(mapping.projectImageRepo.name, undefined);
            record.set(mapping.shareAppService.name, undefined);
            record.set(mapping.repoAddress.name, undefined);
            record.set(mapping.username.name, undefined);
            record.set(mapping.password.name, undefined);
            record.set(mapping.nexus.name, undefined);
            if (value === productSourceData[6].value) {
              record.getField(mapping.relativeMission.name).set('required', true);
            } else {
              record.getField(mapping.relativeMission.name).set('required', false);
            }
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
          case mapping.image.name: {
            record.set(mapping.imageVersion.name, undefined);
            break;
          }
          case mapping.projectImageRepo.name: {
            record.set(mapping.image.name, undefined);
            record.set(mapping.imageVersion.name, undefined);
            break;
          }
          case mapping.marketAppVersion.name: {
            record.set(mapping.marketServiceVersion.name, undefined);
            switch (value) {
              // 如果是选配
              case OPTIONAL: {
                marketServiceVersionDataSet.setQueryParameter('type', value);
                marketServiceVersionDataSet.query();
                break;
              }
              default: {
                marketServiceVersionDataSet.setQueryParameter('version', value);
                marketServiceVersionDataSet.query();
                break;
              }
            }
            break;
          }
          case mapping.projectProductRepo.name: {
            record.set(mapping.groupId.name, undefined);
            break;
          }
          case mapping.nexus.name: {
            record.set(mapping.projectProductRepo.name, undefined);
            break;
          }
          default: {
            break;
          }
        }
      },
    },
  });
};

export default conGroupDataSet;

export {
  mapping, productTypeData, productSourceData, repoTypeData,
};
