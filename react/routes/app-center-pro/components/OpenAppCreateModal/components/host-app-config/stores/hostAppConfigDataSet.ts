import { DataSet } from 'choerodon-ui/pro';
import omit from 'lodash/omit';
import { Base64 } from 'js-base64';
import { DataSetProps, FieldProps, FieldType } from '@/interface';
import {
  productSourceData,
  productTypeData,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';
import { nexusApiConfig } from '@/api/Nexus';
import { rdupmApiApiConfig } from '@/api/Rdupm';
import { deployApi, deployApiConfig } from '@/api';
import { hostApiConfig } from '@/api/Host';

const mapping: {
  [key: string]: FieldProps
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
  host: {
    name: 'hostId',
    type: 'string' as FieldType,
    label: '主机',
    required: true,
    textField: 'name',
    valueField: 'id',
    options: new DataSet({
      autoQuery: true,
      transport: {
        read: () => ({
          ...hostApiConfig.getHosts(),
          transformResponse: (res) => {
            let newRes = res;
            try {
              newRes = JSON.parse(newRes);
              newRes.content = newRes.content.map((i: any) => ({
                ...i,
                connect: i.hostStatus === 'connected',
              }));
              return newRes;
            } catch (e) {
              return newRes;
            }
          },
        }),
      },
    }),
  },
  jarSource: {
    name: 'sourceType',
    label: 'jar包来源',
    type: 'string' as FieldType,
    textField: 'name',
    valueField: 'value',
    options: new DataSet({
      data: productSourceData,
    }),
    defaultValue: productSourceData[0].value,
  },
  nexus: {
    name: 'nexusId',
    type: 'string' as FieldType,
    label: 'Nexus服务',
    textField: 'serverName',
    valueField: 'configId',
    dynamicProps: {
      required: ({ record }) => record?.get(
          mapping.jarSource.name,
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
      required: ({ record }) => record?.get(
          mapping.jarSource.name,
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
      required: ({ record }) => record?.get(
          mapping.jarSource.name,
        ) === productSourceData[0].value,
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.projectProductRepo.name)) {
          return ({
            ...rdupmApiApiConfig.getGroupId(
              record?.get(mapping.projectProductRepo.name).repositoryId
              || record?.get(mapping.projectProductRepo.name),
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
      required: ({ record }) => record?.get(
          mapping.jarSource.name,
        ) === productSourceData[0].value,
      lookupAxiosConfig: ({ record }) => {
        if (record?.get(mapping.projectProductRepo.name)) {
          return ({
            ...rdupmApiApiConfig.getArtifactId(
              record?.get(mapping.projectProductRepo.name).repositoryId
              || record?.get(mapping.projectProductRepo.name),
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
      required: ({ record }) => record?.get(
          mapping.jarSource.name,
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
              repositoryId: record?.get(mapping.projectProductRepo.name).repositoryId
                || record?.get(mapping.projectProductRepo.name),
              repositoryName: record?.get(mapping.projectProductRepo.name).neRepositoryName,
            }),
          });
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
        mapping.jarSource.name,
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
        mapping.jarSource.name,
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
                  return newD;
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
  value: {
    name: 'value',
    type: 'string' as FieldType,
    defaultValue: '# java -jar指令\n'
      + '# 不可删除${jar}\n'
      + '# java -jar 后台运行参数会自动添加 不需要在重复添加\n'
      + '# 其余参数可参考可根据需要添加\n'
      + 'java -jar ${jar}\n'
      + '# 相关文件存放目录：jar包下载目录为$HOME/choerodon/实例id/temp-jar/, 日志存放目录为$HOME/choerodon/实例id/temp-jar/',
  },
  uploadUrl: {
    name: 'jarFileUrl',
    type: 'string' as FieldType,
  },
  fileName: {
    name: 'fileName',
    type: 'string' as FieldType,
  },
};

const hostAppConfigDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
  transport: {
    update: ({ data: [data] }) => {
      const res = data;
      res.prodJarInfoVO = {
        ...res.prodJarInfoVO,
        [mapping.jarVersion.name as string]: res[mapping.jarVersion.name as string],
      };
      res.appName = res[mapping.appName.name as string];
      res.appCode = res[mapping.appCode.name as string];
      res.value = Base64.encode(res.value);
      return deployApiConfig.deployJava(res);
    },
  },
  events: {
    update: async ({ record, name, value }: any) => {
      switch (name) {
        case mapping.jarSource.name: {
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

export default hostAppConfigDataSet;

export { mapping };
