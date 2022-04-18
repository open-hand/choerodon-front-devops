import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { devopsDockerComposeApiConfig } from '@choerodon/master';
import { NewTips } from '@choerodon/components';

const operationData = [{
  title: '基于当前配置修改',
  value: 'current',
}, {
  title: '回滚至历史版本',
  value: 'history',
}];

const mapping: any = {
  appName: {
    name: 'name',
    type: 'string',
    label: '应用名称',
  },
  appCode: {
    name: 'code',
    type: 'string',
    label: '应用编码',
    disabled: true,
  },
  operation: {
    textField: 'title',
    valueField: 'value',
    name: 'operation',
    type: 'string',
    // label: (<p>
    //   操作类型
    //   <NewTips helpText="基于当前配置修改表示您可直接在下方yml文件中进行修改；
    // 回滚至历史版本表示您需要选择一个之前标记的版本备注，并使用当时的yml文件进行部署。"
    //   />
    // </p>),
    options: new DataSet({
      data: operationData,
    }),
    defaultValue: operationData[0].value,
  },
  versionMark: {
    name: 'remark',
    type: 'string',
    label: '版本备注',
    textField: 'remark',
    valueField: 'id',
  },
  dockerCompose: {
    name: 'value',
    type: 'string',
    required: true,
    defaultValue: `
# docker-compose.yaml文件,比如启动一个postgres程序
version: "3.3"
  
services:
  db:
    image: postgres
    volumes:
      - ./data/db:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    `,
  },
  command: {
    name: 'runCommand',
    type: 'string',
    required: true,
    defaultValue: `
# 后台启动docker-compose应用
docker-compose up -d
    `,
  },
};

const transformSubmitData = (ds: any, data?: any) => {
  const record = ds?.current;
  let result: any = {
    [mapping.command.name]: record?.get(mapping.command.name),
    ...data ? {
      appName: record?.get(mapping.appName.name),
      appCode: record?.get(mapping.appCode.name),
    } : {},
  };

  if (!data || record?.get(mapping.operation.name) === operationData[0].value) {
    result = {
      ...result,
      dockerComposeValueDTO: {
        [mapping.versionMark.name]: record?.get(mapping.versionMark.name),
        [mapping.dockerCompose.name]: record?.get(mapping.dockerCompose.name),
      },
    };
  } else {
    result = {
      ...result,
      valueId: record?.get(mapping.versionMark.name),
    };
  }

  return result;
};

const transformLoadData = (data: any) => ({
  [mapping.appName.name]: data?.[mapping.appName.name],
  [mapping.appCode.name]: data?.[mapping.appCode.name],
  [mapping.versionMark.name]: '',
  [mapping.dockerCompose.name]: data?.dockerComposeValueDTO?.[mapping.dockerCompose.name],
  [mapping.command.name]: data?.[mapping.command.name],
  [mapping.operation.name]: mapping.operation.defaultValue,
});

const Index = (data: any) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    switch (key) {
      case 'appName': {
        item.dynamicProps = {
          required: () => !!data,
        };
        break;
      }
      case 'versionMark': {
        if (data) {
          item.options = new DataSet({
            autoQuery: true,
            transport: {
              read: () => ({
                ...devopsDockerComposeApiConfig.getValuesRecordsList(data?.id),
              }),
            },
          });
        }
        item.dynamicProps = {
          required: ({ record }: any) => {
            let result;
            if (data) {
              if (record?.get(mapping.operation.name) === operationData[0].value) {
                result = false;
              } else {
                result = true;
              }
            } else {
              result = true;
            }
            return result;
          },
        };
        break;
      }
    }
    return item;
  }),
  events: {
    update: ({ name, value, record }: any) => {
      switch (name) {
        case mapping.versionMark.name: {
          if (data) {
            if (value) {
              const optionsData = record?.getField(mapping.versionMark.name).options?.toData();
              const item = optionsData?.find((i: any) => i?.id === value);
              if (item) {
                record?.set(mapping.dockerCompose.name, item.value);
              }
            }
          }
          break;
        }
        case mapping.operation.name: {
          if (value === operationData[0].value) {
            record?.set(mapping.versionMark.name, '');
          } else {
            record?.set(mapping.versionMark.name, data?.dockerComposeValueDTO?.id);
          }
        }
      }
    },
  },
});

export default Index;

export {
  mapping,
  transformSubmitData,
  transformLoadData,
  operationData,
};
