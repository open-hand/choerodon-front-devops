import { DataSet } from 'choerodon-ui/pro';
import BaseComDeployApis from '@/routes/deployment/modals/base-comDeploy/apis';
import BaseComDeployServices from '@/routes/deployment/modals/base-comDeploy/services';
import uuidV1 from 'uuid/v1';
import { axios } from '@choerodon/master';

const deployWayOptionsData = [{
  text: '容器部署',
  value: 'env',
}, {
  text: '主机部署',
  value: 'host',
}];

const deployModeOptionsData = [{
  text: '单机模式',
  value: 'standalone',
}, {
  text: '哨兵模式',
  value: 'sentinel',
}];

async function checkResourceName(value, name, record, projectId) {
  const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
  if (value && pa.test(value)) {
    return true;
  }
  return '名称只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾';
}

async function checkName(value, name, record, projectId) {
  const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
  if (value && pa.test(value)) {
    if (!record.get(mapping.env.name)) return;
    try {
      const res = await axios.get(`/devops/v1/projects/${projectId}/app_service_instances/check_name?instance_name=${value}&env_id=${record.get(mapping.env.name)}`);
      if ((res && res.failed) || !res) {
        // eslint-disable-next-line consistent-return
        return '名称已存在';
      }
      // eslint-disable-next-line consistent-return
      return true;
    } catch (err) {
      // eslint-disable-next-line consistent-return
      return '名称重名校验失败，请稍后再试';
    }
  } else {
    // eslint-disable-next-line consistent-return
    return '名称只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾';
  }
  // eslint-disable-next-line consistent-return
  return true;
}

const middleWareData = [{
  value: 'redis',
  text: 'redis',
}, {
  value: 'mysql',
  text: 'mysql',
}];

const mapping = {
  middleware: {
    name: 'middleware',
    defaultValue: middleWareData[0].value,
    type: 'string',
    options: new DataSet({
      data: middleWareData,
    }),
  },
  serviceVersion: {
    name: 'version',
    type: 'string',
    label: '服务版本',
    required: true,
    textField: 'versionNumber',
    valueField: 'versionNumber',
  },
  deployWay: {
    name: 'deployWay',
    type: 'string',
    label: '部署方式',
    textField: 'text',
    valueField: 'value',
    defaultValue: deployWayOptionsData[0].value,
    options: new DataSet({
      data: deployWayOptionsData,
    }),
  },
  deployMode: {
    name: 'mode',
    type: 'string',
    label: '部署模式',
    textField: 'text',
    valueField: 'value',
    defaultValue: deployModeOptionsData[1].value,
    options: new DataSet({
      data: deployModeOptionsData,
    }),
  },
  resourceName: {
    name: 'resourceName',
    type: 'string',
    label: '资源名称',
    maxLength: 64,
  },
  env: {
    name: 'environmentId',
    type: 'string',
    label: '环境',
    textField: 'name',
    valueField: 'id',
  },
  instance: {
    name: 'instanceName',
    type: 'string',
    label: '实例名称',
    // defaultValue: `${middleWareData[0].value}-${uuidV1().substring(0, 5)}`,
    maxLength: 64,
  },
  pvc: {
    name: 'pvc',
    type: 'string',
    label: 'PVC名称',
  },
  values: {
    name: 'values',
    type: 'string',
    defaultValue: '',
  },
};

export {
  mapping, deployWayOptionsData, deployModeOptionsData, middleWareData,
};

export default (projectId, HostSettingDataSet, BaseComDeployStore) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    if (key === 'serviceVersion') {
      item.lookupAxiosConfig = ({ record }) => ({
        url: BaseComDeployApis.getServiceVersionApi(),
        method: 'get',
        transformResponse: (res) => {
          function finalFunc(data) {
            if (data.length && data.length > 0) {
              if (record) {
                record.set(mapping.serviceVersion.name, data[0].versionNumber);
              }
            }
            BaseComDeployStore.setServiceVersionList(data);
          }
          let newRes = res;
          try {
            newRes = JSON.parse(newRes);
            finalFunc(newRes);
            return newRes;
          } catch (e) {
            finalFunc(newRes);
            return newRes;
          }
        },
      });
    } else if (key === 'env') {
      item.lookupAxiosConfig = () => ({
        url: BaseComDeployApis.getEnvListApi(projectId),
        method: 'get',
      });
      item.dynamicProps = {
        required: ({ record }) => (record.get(mapping.middleware.name) === middleWareData[0].value)
        && (record.get(mapping.deployWay.name) === deployWayOptionsData[0].value),
      };
    } else if (key === 'instance') {
      item.validator = (value, name, record) => checkName(value, name, record, projectId);
      item.dynamicProps = {
        required: ({ record }) => (record.get(mapping.middleware.name) === middleWareData[0].value)
        && (record.get(mapping.deployWay.name) === deployWayOptionsData[0].value),
      };
      item.defaultValue = `${middleWareData[0].value}-${uuidV1().substring(0, 5)}`;
    } else if (key === 'resourceName') {
      item.dynamicProps = {
        required: ({ record }) => (record.get(mapping.middleware.name) === middleWareData[0].value)
            && (record.get(mapping.deployWay.name) === deployWayOptionsData[1].value),
      };
      item.validator = (value, name, record) => {
        if (record.get(mapping.deployWay.name) === deployWayOptionsData[1].value) {
          return checkResourceName(value, name, record, projectId);
        }
        return true;
      };
      item.defaultValue = `${middleWareData[0].value}-${uuidV1().substring(0, 5)}`;
    }
    return item;
  }),
  events: {
    update: async ({
      dataSet, record, name, value,
    }) => {
      switch (name) {
        case mapping.deployWay.name: {
          // 主机部署
          if (value === deployWayOptionsData[1].value) {
            // 单机
            if (record.get(mapping.deployMode.name) === deployModeOptionsData[0].value) {
              HostSettingDataSet.splice(0, HostSettingDataSet.records.length);
              HostSettingDataSet.create();
            } else {
              HostSettingDataSet.splice(0, HostSettingDataSet.records.length);
              HostSettingDataSet.create();
              HostSettingDataSet.create();
              HostSettingDataSet.create();
            }
          }
          break;
        }
        case mapping.middleware.name:
          record.set(mapping.instance.name, `${value}-${uuidV1().substring(0, 5)}`);
          break;
        case mapping.deployMode.name:
          // 如果是主机部署
          if (record.get(mapping.deployWay.name) === deployWayOptionsData[1].value) {
            if (value === deployModeOptionsData[0].value) {
              HostSettingDataSet.splice(0, HostSettingDataSet.records.length);
              HostSettingDataSet.create();
            } else {
              HostSettingDataSet.splice(0, HostSettingDataSet.records.length);
              HostSettingDataSet.create();
              HostSettingDataSet.create();
              HostSettingDataSet.create();
            }
          } else {
            //  如果是环境部署
            const deployMode = value;
            const serviceVersion = record.get(mapping.serviceVersion.name);
            const lookupData = BaseComDeployStore.getServiceVersionList;
            const appVersionId = lookupData
              .find((item) => item.versionNumber === serviceVersion).id;
            const result = await BaseComDeployServices
              .axiosGetMiddlewareValue(appVersionId, deployMode);
            record.set(mapping.values.name, result || '');
          }
          break;
        case mapping.serviceVersion.name: {
          if (record.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
            const deployMode = record.get(mapping.deployMode.name);
            const lookupData = BaseComDeployStore.getServiceVersionList;
            const appVersionId = lookupData.find((item) => item.versionNumber === value).id;
            const result = await BaseComDeployServices
              .axiosGetMiddlewareValue(appVersionId, deployMode);
            record.set(mapping.values.name, result || '');
          }
          break;
        }
        default:
          break;
      }
    },
  },
});
