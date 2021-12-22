import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { RdupmAlienApiConfig } from '@choerodon/master';
import {
  STEPVO, BUILD_DOCKER, BUILD_UPLOADJAR, BUILD_MAVEN, BUILD_MAVEN_PUBLISH,
} from '@/routes/app-pipeline/CONSTANTS';
import customRepoConfigDataSet
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/customRepoConfigDataSet';

const settingConfigOptionsData = [{
  text: '自定义仓库配置',
  value: 'custom',
}, {
  text: '粘贴XML内容',
  value: 'xml',
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
    options: new DataSet({
      paging: true,
      autoQuery: true,
      transport: {
        read: () => ({
          ...RdupmAlienApiConfig.getnexusMavenRepoIds(),
        }),
      },
    }),
  },
  dockerFilePath: {
    name: 'dockerFilePath',
    type: 'string',
    label: 'Dockerfile文件路径',
    dynamicProps: {
      required: ({ record }: any) => record.get(mapping.type.name) === BUILD_DOCKER,
    },
  },
  imageContext: {
    name: 'dockerContextDir',
    type: 'string',
    label: '镜像构建上下文',
    dynamicProps: {
      required: ({ record }: any) => record.get(mapping.type.name) === BUILD_DOCKER,
    },
  },
  targetProductsLibrary: {
    name: 'nexusRepoId',
    type: 'string',
    label: '目标制品库',
    textField: 'name',
    valueField: 'repositoryId',
    dynamicProps: {
      required: ({ record }: any) => {
        console.log(record.get(mapping.type.name));
        return record.get(mapping.type.name) === BUILD_UPLOADJAR;
      },
    },
    options: new DataSet({
      paging: true,
      autoQuery: true,
      transport: {
        read: () => ({
          ...RdupmAlienApiConfig.getnexusMavenRepoIds('hosted'),
        }),
      },
    }),
  },
  TLS: {
    name: 'skipDockerTlsVerify',
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
    options: new DataSet({
      data: [{
        text: '小于等于',
        value: '<=',
      }],
    }),
    disabled: true,
  },
  condition: {
    name: 'vulnerabilityCount',
    type: 'number',
    label: '漏洞数量',
  },
  examType: {
    name: 'scannerType',
    type: 'string',
    label: '检查类型',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: 'SonarScanner',
        value: 'SonarScanner',
      }, {
        text: 'SonarMaven',
        value: 'SonarMaven',
      }],
    }),
  },
  whetherMavenSingleMeasure: {
    name: 'whetherMavenSingleMeasure',
    type: 'boolean',
    label: '是否执行Maven单测',
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
  sonarqubeConfigWay: {
    name: 'configType',
    type: 'string',
    label: 'SonarQube配置方式',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '默认配置',
        value: 'default',
      }, {
        text: '自定义配置',
        value: 'custom',
      }],
    }),
  },
  sonarqubeAccountConfig: {
    name: 'sonarqubeAccountConfig',
    type: 'string',
    label: 'SonarQube账号配置',
    textField: 'text',
    valueField: 'value',
    options: new DataSet({
      data: [{
        text: '用户名与密码',
        value: '1',
      }, {
        text: 'Token',
        value: '2',
      }],
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
    name: 'address',
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
};

const transformLoadDataItem = (d: any) => ({
  ...d,
  [mapping.expand.name]: true,
  [mapping.settingConfig.name]: settingConfigOptionsData[0].value,
  [mapping.advancedExpand.name]: false,
  ...d[STEPVO[d.type]],
});

const transformLoadData = (data: any) => data && data.map((d: any) => transformLoadDataItem(d));

const getInsideDtoData = (record: any) => {
  const type = record.get(mapping.type.name);
  switch (type) {
    case BUILD_MAVEN: {
      return ({
        [mapping.projectRelyRepo.name]: record.get(mapping.projectRelyRepo.name),
        repos: record.getField(mapping.customRepoConfig.name).options.toData(),
        [mapping.advancedXml.name]: record?.get(mapping.advancedXml.name),
      });
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
        [mapping.projectRelyRepo.name]: record.get(mapping.projectRelyRepo.name),
        repos: record.getField(mapping.customRepoConfig.name).options.toData(),
        [mapping.advancedXml.name]: record?.get(mapping.advancedXml.name),
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
  [STEPVO?.[record?.get(mapping.type.name)]]: getInsideDtoData(record),
}));

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
  events: {
    update: ({ name, value, record }: any) => {
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
            }
          });
          break;
        }
      }
    },
  },
});

export default Index;

export {
  mapping,
  transformLoadData,
  transformSubmitData,
  transformLoadDataItem,
  settingConfigOptionsData,
};
