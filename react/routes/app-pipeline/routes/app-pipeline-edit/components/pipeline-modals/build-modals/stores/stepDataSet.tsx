import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { RdupmAlienApiConfig } from '@choerodon/master';
import _ from 'lodash';
import {
  STEPVO, BUILD_DOCKER, BUILD_UPLOADJAR, BUILD_MAVEN, BUILD_MAVEN_PUBLISH, BUILD_SONARQUBE,
} from '@/routes/app-pipeline/CONSTANTS';
import customRepoConfigDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/customRepoConfigDataSet';
import { handleOk } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/content';

const settingConfigOptionsData = [{
  text: '自定义仓库配置',
  value: 'custom',
}, {
  text: '粘贴XML内容',
  value: 'xml',
}];

const sonarConfigData = [{
  text: '默认配置',
  value: 'default',
}, {
  text: '自定义配置',
  value: 'custom',
}];

const scanTypeData = [{
  text: 'SonarScanner',
  value: 'SonarScanner',
}, {
  text: 'SonarMaven',
  value: 'SonarMaven',
}];

const accountConfigData = [{
  text: '用户名与密码',
  value: 'username',
}, {
  text: 'Token',
  value: 'token',
}];

const mapping: {
  [key: string]: any
} = {
  expand: {
    name: 'expand',
    type: 'boolean',
    defaultValue: true,
  },
  advancedExpand: {
    name: 'advancedExpand',
    type: 'boolean',
    defaultValue: false,
  },
  settingConfig: {
    name: 'settingConfig',
    type: 'string',
    label: 'Setting配置',
    textField: 'text',
    valueField: 'value',
    required: true,
    defaultValue: 'custom',
    options: new DataSet({
      data: settingConfigOptionsData,
    }),
  },
  script: {
    name: 'script',
    type: 'string',
  },
  name: {
    name: 'name',
    type: 'string',
  },
  type: {
    name: 'type',
    type: 'string',
  },
  stepName: {
    name: 'name',
    type: 'string',
    label: '步骤名称',
    required: true,
  },
  projectRelyRepo: {
    name: 'nexusMavenRepoIds',
    type: 'string',
    label: '项目依赖仓库',
    multiple: true,
    textField: 'name',
    valueField: 'repositoryId',
  },
  dockerFilePath: {
    name: 'dockerFilePath',
    type: 'string',
    label: 'Dockerfile文件路径',
  },
  imageContext: {
    name: 'dockerContextDir',
    type: 'string',
    label: '镜像构建上下文',
  },
  token: {
    name: 'token',
    type: 'string',
    label: 'Token',
  },
  targetProductsLibrary: {
    name: 'nexusRepoId',
    type: 'string',
    label: '目标制品库',
    textField: 'name',
    valueField: 'repositoryId',
  },
  TLS: {
    name: 'enableDockerTlsVerify',
    type: 'boolean',
    label: '是否启用TLS校验',
    textField: 'text',
    valueField: 'value',
    defaultValue: false,
    options: new DataSet({
      data: [{
        text: '是',
        value: true,
      }, {
        text: '否',
        value: false,
      }],
    }),
  },
  imageSafeScan: {
    name: 'imageScan',
    type: 'boolean',
    label: '是否启用镜像安全扫描',
    textField: 'text',
    valueField: 'value',
    defaultValue: false,
    options: new DataSet({
      data: [{
        text: '是',
        value: true,
      }, {
        text: '否',
        value: false,
      }],
    }),
  },
  imagePublishGuard: {
    name: 'securityControl',
    type: 'boolean',
    label: '是否启用镜像发布门禁',
    defaultValue: true,
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '是',
        value: true,
      }, {
        text: '否',
        value: false,
      }],
    }),
  },
  bugLevel: {
    name: 'severity',
    type: 'string',
    label: '漏洞严重度',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '危急',
        value: 'CRITICAL',
      }, {
        text: '严重',
        value: 'HIGH',
      }, {
        text: '中等',
        value: 'MEDIUM',
      }, {
        text: '较低',
        value: 'LOW',
      }],
    }),
  },
  symbol: {
    name: 'securityControlConditions',
    type: 'string',
    label: '比较符',
    defaultValue: '<=',
    textField: 'text',
    valueField: 'value',
    dynamicProps: {
      disabled: ({ record }: any) => !record.get(mapping.imagePublishGuard.name),
    },
    options: new DataSet({
      data: [{
        text: '小于等于',
        value: '<=',
      }],
    }),
  },
  condition: {
    name: 'vulnerabilityCount',
    type: 'number',
    label: '漏洞数量',
    min: 0,
    step: 1,
  },
  examType: {
    name: 'scannerType',
    type: 'string',
    label: '检查类型',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: scanTypeData,
    }),
  },
  scanPath: {
    name: 'sources',
    type: 'string',
    label: '扫描路径',
  },
  whetherMavenSingleMeasure: {
    name: 'skipTests',
    type: 'boolean',
    label: '是否执行Maven单测',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '是',
        value: false,
      }, {
        text: '否',
        value: true,
      }],
    }),
  },
  sonarqubeConfigWay: {
    name: 'configType',
    type: 'string',
    label: 'SonarQube配置方式',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: sonarConfigData,
    }),
  },
  sonarqubeAccountConfig: {
    name: 'authType',
    type: 'string',
    label: 'SonarQube账号配置',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: accountConfigData,
    }),
  },
  username: {
    name: 'username',
    type: 'string',
    label: 'SonarQube用户名',
  },
  password: {
    name: 'password',
    type: 'string',
    label: '密码',
  },
  address: {
    name: 'sonarUrl',
    type: 'string',
    label: 'SonarQube地址',
  },
  customRepoConfig: {
    name: 'customRepoConfig',
    type: 'object',
    options: new DataSet(customRepoConfigDataSet()),
  },
  advancedXml: {
    name: 'settings',
    type: 'string',
  },
  sequence: {
    name: 'sequence',
    type: 'number',
  },
  id: {
    name: 'id',
    type: 'string',
  },
};

const transformLoadDataItem = (d: any, index: number) => {
  const newD = JSON.parse(JSON.stringify(d));
  return ({
    ...newD,
    [mapping.expand.name]: true,
    [mapping.settingConfig.name]: settingConfigOptionsData[0].value,
    [mapping.advancedExpand.name]: false,
    [mapping.sonarqubeConfigWay.name]: sonarConfigData[0].value,
    [mapping.sonarqubeAccountConfig.name]: accountConfigData[0].value,
    [mapping.whetherMavenSingleMeasure.name]: false,
    [mapping.sequence.name]: index,
    ...newD[STEPVO[newD.type]],
    [mapping.customRepoConfig.name]: newD[STEPVO[newD.type]]?.repos,
    [mapping.id.name]: newD?.[mapping.id.name],
  });
};

const transformLoadData = (data: any) => data
  && data.map((d: any, index: number) => transformLoadDataItem(d, index));

const getInsideDtoData = (record: any) => {
  const type = record.get(mapping.type.name);
  switch (type) {
    case BUILD_MAVEN: {
      const result = {
        [mapping.projectRelyRepo.name]:
          JSON.parse(JSON.stringify(record.get(mapping.projectRelyRepo.name))),
        [mapping.settingConfig.name]: record.get(mapping.settingConfig.name),
        repos: record.getField(mapping.customRepoConfig.name).options.toData(),
        [mapping.advancedXml.name]: record?.get(mapping.advancedXml.name),
      };
      return result;
      break;
    }
    case BUILD_DOCKER: {
      return ({
        [mapping.dockerFilePath.name]: record.get(mapping.dockerFilePath.name),
        [mapping.imageContext.name]: record.get(mapping.imageContext.name),
        [mapping.TLS.name]: record.get(mapping.TLS.name),
        [mapping.imageSafeScan.name]: record.get(mapping.imageSafeScan.name),
        [mapping.imagePublishGuard.name]: record.get(mapping.imagePublishGuard.name),
        [mapping.bugLevel.name]: record.get(mapping.bugLevel.name),
        [mapping.symbol.name]: record.get(mapping.symbol.name),
        [mapping.condition.name]: record.get(mapping.condition.name),
      });
      break;
    }
    case BUILD_MAVEN_PUBLISH: {
      return ({
        [mapping.targetProductsLibrary.name]: record.get(mapping.targetProductsLibrary.name),
        [mapping.projectRelyRepo.name]:
          JSON.parse(JSON.stringify(record.get(mapping.projectRelyRepo.name))),
        [mapping.settingConfig.name]: record.get(mapping.settingConfig.name),
        repos: record.getField(mapping.customRepoConfig.name).options.toData(),
        [mapping.advancedXml.name]: record?.get(mapping.advancedXml.name),
      });
      break;
    }
    case BUILD_SONARQUBE: {
      return ({
        [mapping.examType.name]: record.get(mapping.examType.name),
        [mapping.scanPath.name]: record.get(mapping.scanPath.name),
        [mapping.whetherMavenSingleMeasure.name]: record
          .get(mapping.whetherMavenSingleMeasure.name),
        [mapping.sonarqubeConfigWay.name]: record.get(mapping.sonarqubeConfigWay.name),
        [mapping.sonarqubeAccountConfig.name]: record.get(mapping.sonarqubeAccountConfig.name),
        [mapping.username.name]: record.get(mapping.username.name),
        [mapping.password.name]: record.get(mapping.password.name),
        [mapping.address.name]: record.get(mapping.address.name),
        [mapping.token.name]: record.get(mapping.token.name),
      });
      break;
    }
    case BUILD_UPLOADJAR: {
      return ({
        [mapping.targetProductsLibrary.name]: record.get(mapping.targetProductsLibrary.name),
      });
      break;
    }
    default: {
      return undefined;
      break;
    }
  }
};

const transformSubmitData = (ds: any) => ds.records.filter((i: any) => i.status !== 'delete').map((record: any) => ({
  [mapping.name.name]: record?.get(mapping.name.name),
  [mapping.type.name]: record?.get(mapping.type.name),
  [mapping.script.name]: record?.get(mapping.script.name),
  [mapping.sequence.name]: record?.get(mapping.sequence.name),
  [mapping.id.name]: record?.get(mapping.id.name),
  ...STEPVO?.[record?.get(mapping.type.name)] ? {
    [STEPVO?.[record?.get(mapping.type.name)]]: getInsideDtoData(record),
  } : {},
}));

const Index = (
  level: any,
  data: any,
  handleJobAddCallback: any,
  advancedRef: any,
) => {
  const {
    template,
    type,
    appService,
    id,
  } = data;

  return ({
    autoCreate: true,
    fields: Object.keys(mapping).map((key) => {
      const item = mapping[key];
      switch (key) {
        case 'bugLevel': case 'symbol': case 'condition': {
          item.dynamicProps = {
            required: ({ record }: any) => record
              .get(mapping.imagePublishGuard.name) && record.get(mapping.imageSafeScan.name),
          };
          break;
        }
        case 'projectRelyRepo': {
          if (level === 'project') {
            item.options = new DataSet({
              paging: true,
              autoQuery: true,
              transport: {
                read: () => ({
                  ...RdupmAlienApiConfig.getnexusMavenRepoIds(),
                }),
              },
            });
          }
          break;
        }
        case 'targetProductsLibrary': {
          if (level === 'project') {
            item.options = new DataSet({
              paging: true,
              autoQuery: true,
              transport: {
                read: () => ({
                  ...RdupmAlienApiConfig.getnexusMavenRepoIds('hosted'),
                }),
              },
            });
          }
          item.dynamicProps = {
            required: ({ record }: any) => (record.get(mapping.type.name) === BUILD_UPLOADJAR) && level === 'project',
          };
          break;
        }
        case 'dockerFilePath': {
          item.dynamicProps = {
            required: ({ record }: any) => (record.get(mapping.type.name) === BUILD_DOCKER) && level === 'project',
          };
          break;
        }
        case 'imageContext': {
          item.dynamicProps = {
            required: ({ record }: any) => (record.get(mapping.type.name) === BUILD_DOCKER) && level === 'project',
          };
          break;
        }
        default: {
          break;
        }
      }
      return item;
    }),
    events: {
      update: ({
        name, value, record, dataSet,
      }: any) => {
        switch (name) {
          case mapping.settingConfig.name: {
            let flag = false;
            if (value === settingConfigOptionsData[0].value) {
              if (record.get(mapping.advancedXml.name)) {
                flag = true;
              }
            } else if (record.Field(mapping.customRepoConfig.name).options?.records.length > 0) {
              flag = true;
            }
            flag && Modal.confirm({
              title: '清空配置',
              children: (
                <p>
                  {
                    value === settingConfigOptionsData[0].value
                      ? '切换至【自定义仓库配置】维护setting配置的方式后，下述已经维护的内容将会清空，确定要切换吗？'
                      : '切换至【粘贴XML内容】维护setting配置的方式后，下述已经维护的仓库信息将会清空，确定要切换吗？'
                  }
                </p>
              ),
            }).then((button: any) => {
              if (button === 'ok') {
                record.set(mapping.advancedXml.name, '');
                record.Field(mapping.customRepoConfig.name).options.loadData([]);
              } else {
                record.set(
                  mapping.settingConfig.name,
                  value === settingConfigOptionsData[0].value
                    ? settingConfigOptionsData[1].value
                    : settingConfigOptionsData[0].value,
                );
              }
            });
            break;
          }
          case mapping.dockerFilePath.name: {
            let res;
            const arrValue = value.split('');
            const lastIndex = _.findLastIndex(arrValue, (o: any) => o === '/');
            if (lastIndex !== -1) {
              res = arrValue.slice(0, lastIndex).join('');
            } else {
              res = '.';
            }
            record.set(mapping.imageContext.name, res);
            break;
          }
          default: {
            break;
          }
        }
        if (!template) {
          handleOk({
            canWait: false,
            StepDataSet: dataSet,
            level,
            template,
            advancedRef,
            handleJobAddCallback,
            type,
            appService,
            id,
            data,
          });
        }
      },
    },
  });
};

export default Index;

export {
  mapping,
  transformLoadData,
  transformSubmitData,
  transformLoadDataItem,
  settingConfigOptionsData,
  scanTypeData,
  sonarConfigData,
  accountConfigData,
};
