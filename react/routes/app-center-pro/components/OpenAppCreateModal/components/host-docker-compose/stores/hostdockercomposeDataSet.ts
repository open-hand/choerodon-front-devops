import { DataSet } from 'choerodon-ui/pro';
import { devopsDockerComposeApiConfig } from '@choerodon/master';

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
  },
  command: {
    name: 'runCommand',
    type: 'string',
    required: true,
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
  [mapping.versionMark.name]: data?.dockerComposeValueDTO?.id,
  [mapping.dockerCompose.name]: data?.dockerComposeValueDTO?.[mapping.dockerCompose.name],
  [mapping.command.name]: data?.[mapping.command.name],
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
      }
    },
  },
});

export default Index;

export {
  mapping,
  transformSubmitData,
  transformLoadData,
};
