import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps, FieldProps, FieldType } from '@/interface';
import {
  productSourceData,
  productTypeData,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';
import { nexusApiConfig } from '@/api/Nexus';
import { rdupmApiApiConfig } from '@/api/Rdupm';
import { deployApiConfig } from '@/api';

const mapping: {
  [key: string]: FieldProps
} = {
  host: {
    name: 'host',
    type: 'string' as FieldType,
    label: '主机',
  },
  jarSource: {
    name: 'jarSource',
    type: 'string' as FieldType,
    options: new DataSet({
      data: productSourceData,
    }),
    defaultValue: productSourceData[0].value,
  },
  nexus: {
    name: 'nexus',
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
    name: 'projectProductRepo',
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
      required: ({ record }) => record?.get(
          mapping.jarSource.name,
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
    name: 'jarVersion',
    type: 'string' as FieldType,
    label: 'jar包版本',
    textField: 'version',
    valueField: 'id',
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
              repositoryId: record?.get(mapping.projectProductRepo.name).repositoryId,
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
    type: 'string' as FieldType,
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
          });
        }
        return undefined;
      },
    },
  },
};

const hostAppConfigDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
  events: {
    update: ({ record, name, value }: any) => {
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
