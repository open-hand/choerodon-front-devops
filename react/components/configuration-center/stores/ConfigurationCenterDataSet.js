import { isNil, every, some } from 'lodash';
import { configApiConfig } from '@/api/ConfigCenter';

const ConfigurationCenterDataSet = ({ projectId, organizationId, optsDS }) => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'mountPath',
      label: '挂载路径',
      type: 'string',
      // eslint-disable-next-line consistent-return
      validator: (value, name, record) => {
        const { configGroup, configCode, versionName } = record.toData();
        if (
          some([!isNil(configGroup), !isNil(versionName), !isNil(configCode)], Boolean)
          && isNil(value)
        ) {
          return '请输入挂载路径';
        }
        if (
          every([isNil(value), isNil(configGroup), isNil(configCode), isNil(versionName)], Boolean)
        ) {
          return true;
        }
      },
    },
    {
      name: 'configGroup',
      label: '配置分组',
      type: 'string',
      lookupAxiosConfig: () => ({
        url: `/governance/v1/${organizationId}/${projectId}/configs/group`,
        transformResponse: (data) => {
          let nextData;
          try {
            nextData = JSON.parse(data);
            nextData = nextData.map((item, index) => ({
              value: item,
              meaning: item,
            }));
            return nextData;
          } catch (err) {
            return data;
          }
        },
      }),
      // eslint-disable-next-line consistent-return
      validator: (value, name, record) => {
        const { mountPath, configCode, versionName } = record.toData();
        if (
          some([!isNil(mountPath), !isNil(versionName), !isNil(configCode)], Boolean)
          && isNil(value)
        ) {
          return '请输入配置分组';
        }
        if (every([isNil(value), isNil(value), isNil(configCode), isNil(versionName)], Boolean)) {
          return true;
        }
      },
    },
    {
      name: 'configCode',
      label: '配置文件',
      type: 'string',
      lookupAxiosConfig: ({ data, params, record }) => {
        const configGroup = record?.get('configGroup');
        return {
          url: `/governance/v1/${organizationId}/${projectId}/configs/group/latest_config?configGroup=${configGroup}`,
          params: { ...data, ...params },
          method: 'get',
          transformResponse: (res) => {
            try {
              let nextContent = JSON.parse(res);
              nextContent = nextContent.map((lineData) => {
                const { configCode, content } = lineData;
                return { value: configCode, meaning: configCode, content };
              });
              return nextContent;
            } catch (err) {
              return null;
            }
          },
        };
      },
      // eslint-disable-next-line consistent-return
      validator: (value, name, record) => {
        const { mountPath, configGroup, versionName } = record.toData();
        if (
          some([!isNil(mountPath), !isNil(versionName), !isNil(configGroup)], Boolean)
          && isNil(value)
        ) {
          return '请输入配置文件';
        }
        if (every([isNil(value), isNil(configGroup), isNil(value), isNil(versionName)], Boolean)) {
          return true;
        }
      },
    },
    {
      name: 'versionName',
      label: '配置文件版本',
      type: 'string',
      options: optsDS,
      // eslint-disable-next-line consistent-return
      validator: (value, name, record) => {
        const { mountPath, configGroup, configCode } = record.toData();
        if (
          some([!isNil(mountPath), !isNil(configCode), !isNil(configGroup)], Boolean)
          && isNil(value)
        ) {
          return '请输入配置文件版本';
        }
        if (every([isNil(value), isNil(configGroup), isNil(configCode), isNil(value)], Boolean)) {
          return true;
        }
      },
    },
    {
      name: 'configId',
      type: 'string',
    },
    {
      name: 'isQuery',
      type: 'string',
    },
  ],
});

const ConfigCompareOptsDS = ({ projectId, organizationId }) => ({
  autoQuery: false,
  autoCreate: true,
  paging: false,
  transport: {
    read: ({ data, params }) => ({
      url: `/governance/v1/${organizationId}/${projectId}/configs/group/latest_config`,
      params: { ...data, ...params },
      method: 'get',
      transformResponse: (res) => {
        try {
          let nextContent = JSON.parse(res);
          nextContent = nextContent.map((lineData) => {
            const { versionName, content } = lineData;
            return { value: versionName, meaning: versionName, content };
          });
          return nextContent;
        } catch (err) {
          return null;
        }
      },
    }),
  },
});

const ConfigurationDetailDataSet = ({ projectId }) => ({
  selection: false,
  transport: {
    read: ({ data }) => configApiConfig.getConfigData(data),
  },
  fields: [
    {
      name: 'mountPath',
      label: '挂载路径',
      type: 'string',
    },
    {
      name: 'configGroup',
      label: '配置分组',
      type: 'string',
    },
    {
      name: 'configCode',
      label: '配置编码',
      type: 'string',
    },
  ],
});

export { ConfigurationCenterDataSet, ConfigCompareOptsDS, ConfigurationDetailDataSet };
