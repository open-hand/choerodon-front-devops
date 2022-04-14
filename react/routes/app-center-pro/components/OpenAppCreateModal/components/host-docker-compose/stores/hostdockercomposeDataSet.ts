import { DataSet } from 'choerodon-ui/pro';
import { devopsDockerComposeApiConfig } from '@choerodon/master';

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
    label: '操作类型',
    options: new DataSet({
      data: operationData,
    }),
    defaultValue: operationData[0].value,
  },
  versionMark: {
    name: 'remark',
    type: 'string',
    label: '版本备注',
    required: true,
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

  if (!data || record?.get(mapping.versionMark.name) === data?.dockerComposeValueDTO?.id) {
    result = {
      ...result,
      dockerComposeValueDTO: {
        [mapping.versionMark.name]: data
          ? data?.dockerComposeValueDTO?.remark : record?.get(mapping.versionMark.name),
        [mapping.dockerCompose.name]: record?.get(mapping.dockerCompose.name),
      },
    };
  }

  if (data && record?.get(mapping.versionMark.name) !== data?.dockerComposeValueDTO?.id) {
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
            } else {
              record?.set(mapping.dockerCompose.name, '');
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
