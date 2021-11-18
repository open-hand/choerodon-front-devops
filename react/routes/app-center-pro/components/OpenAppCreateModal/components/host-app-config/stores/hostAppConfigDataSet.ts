/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSet } from 'choerodon-ui/pro';
import omit from 'lodash/omit';
import { Base64 } from 'js-base64';
import {
  DataSetProps, FieldProps, FieldType, Record,
} from '@/interface';
import {
  productSourceData,
  productTypeData,
} from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';
import { nexusApiConfig } from '@/api/Nexus';
import { rdupmApiApiConfig } from '@/api/Rdupm';
import {
  deployApi, deployApiConfig, hostApi, middlewareConfigApi,
} from '@/api';
import { hostApiConfig } from '@/api/Host';
import { setData } from '../content';

const updateModalProps = (record: any, modal: any) => {
  if (record.get(mapping.jarSource.name) === productSourceData[5].value) {
    if (!record.get(mapping.uploadUrl.name)
      || !record.get(mapping.fileName.name)) {
      modal.update({
        okProps: {
          disabled: true,
        },
      });
    } else {
      modal.update({
        okProps: {
          disabled: false,
        },
      });
    }
  } else {
    modal.update({
      okProps: {
        disabled: false,
      },
    });
  }
};

const hostDataSetConfig = () => ({
  autoQuery: true,
  transport: {
    read: () => ({
      ...hostApiConfig.getHosts(),
      transformResponse: (res: any) => {
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
});

const mapping: {
  [key: string]: FieldProps
} = {
  appName: {
    name: 'name',
    type: 'string' as FieldType,
    label: '应用名称',
    validator: async (value, type, record: Record) => {
      let res: any = '应用名称已重复';
      const flag = await hostApi.checkAppName(value, record.get('id'));
      if (flag) {
        res = true;
      }
      return res;
    },
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
    textField: 'name',
    valueField: 'id',
    options: new DataSet(hostDataSetConfig()),
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
                return data.map((i: any) => {
                  if (typeof i === 'string') {
                    return ({
                      name: i,
                      value: i,
                    });
                  }
                  return i;
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
                return data.map((i: any) => {
                  if (typeof i === 'string') {
                    return ({
                      name: i,
                      value: i,
                    });
                  }
                  return i;
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
            ...deployApiConfig.deployVersion(record?.get(mapping.marketAppVersion.name), 'jar'),
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
    name: 'preCommand',
    type: 'string' as FieldType,
    defaultValue: `
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE、。
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#所有命令操作仅只能在WORK_DIR进行。
#可以执行下面这些命令：
#解压压缩包（tar -xvf \${APP_FILE}）
#下载配置文件（curl www.config.center.com/application.yaml -o \${WORK_DIR}/application.yaml）`,
  },
  startCommand: {
    name: 'runCommand',
    type: 'string' as FieldType,
    defaultValue: `
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE、。
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#所有命令操作仅只能在WORK_DIR进行。
#该输入框中仅能填写一行启动命令，比如
#启动jar应用：java -jar \${APP_FILE} -D--spring.cloud.bootstrap.location=$WORK_DIR/application.yaml
#启动golang应用：./c7n-agent
#启动python应用：python3 main.py
#对PHP、war包这类应用的启动命令应该放到后置操作里面`,
  },
  postCommand: {
    name: 'postCommand',
    type: 'string' as FieldType,
    defaultValue: `
#系统提供内置变量，WORK_DIR、APP_FILE_NAME、APP_FILE、。
#WORK_DIR表示工作目录；
#APP_FILE_NAME表示上传文件在主机上的名称；
#APP_FILE表示上传文件保存在主机上的路径；
#APP_FILE=\${WORK_DIR}/\${APP_FILE_NAME}。
#所有命令操作仅只能在WORK_DIR进行。
#启动PHP服务：php-fpm -c /usr/local/php/etc/php.ini -y /usr/local/php/etc/php-fpm.conf
#重启PHP服务（ps -ef | grep 'php-fpm'|awk '{print $2}'|kill -USR2）
#./server.startup -tomcat`,
  },
  uploadUrl: {
    name: 'uploadUrl',
    type: 'string' as FieldType,
  },
  fileName: {
    name: 'fileName',
    type: 'string' as FieldType,
  },
//   configSettingVOS: {
//     name: 'configSettingVOS',
//     type: 'array' as FieldType,
//   },
};

const hostAppConfigDataSet = (modal: any, detail: any): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => {
    const item = mapping[i];
    switch (i) {
      case 'host': {
        if (detail) {
          item.required = true;
        }
        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
  transport: {
    update: ({ data: [data] }) => {
      let func;
      if (data.rdupmType === 'other') {
        return deployApiConfig.deployCustom({
          ...setData(data),
          appName: data[mapping.appName.name as string],
          appCode: data[mapping.appCode.name as string],
        });
      }
      if (data[mapping.jarSource.name as string] === productSourceData[7].value) {
        return middlewareConfigApi.updateHost({
          ...setData(data),
          appName: data[mapping.appName.name as string],
          appCode: data[mapping.appCode.name as string],
        });
      }
      return deployApiConfig.deployJava({
        ...setData(data),
        appName: data[mapping.appName.name as string],
        appCode: data[mapping.appCode.name as string],
      });
    },
  },
  events: {
    update: async ({ record, name, value }: any) => {
      switch (name) {
        case mapping.jarSource.name: {
          record.set(mapping.marketAppVersion.name, undefined);
          record.set(mapping.marketServiceVersion.name, undefined);
          record.set(mapping.nexus.name, undefined);

          updateModalProps(record, modal);
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
        case mapping.uploadUrl.name: {
          updateModalProps(record, modal);
          break;
        }
        case mapping.fileName.name: {
          updateModalProps(record, modal);
          break;
        }
        case mapping.nexus.name: {
          record.set(mapping.projectProductRepo.name, undefined);
          break;
        }
        case mapping.artifactId.name: {
          record.set(mapping.jarVersion.name, undefined);
          break;
        }
        case mapping.groupId.name: {
          record.set(mapping.artifactId.name, undefined);
          break;
        }
        case mapping.projectProductRepo.name: {
          record.set(mapping.groupId.name, undefined);
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

export { mapping, hostDataSetConfig };
