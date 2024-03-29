import { DataSet } from 'choerodon-ui/pro';
import uuidV1 from 'uuid';
import { axios } from '@choerodon/master';
import BaseComDeployApis from '@/routes/deployment/modals/base-comDeploy/apis';
import BaseComDeployServices from '@/routes/deployment/modals/base-comDeploy/services';
// eslint-disable-next-line import/no-cycle
import { mapping as paramsMapping } from './paramSettingDataSet';

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

const mySqlDeployModeOptionsData = [{
  text: '单机模式',
  value: 'standalone',
}, {
  text: '主备模式',
  value: 'master-slave',
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
  value: 'Redis',
  text: 'redis',
}, {
  value: 'MySQL',
  text: 'mysql',
}];

const mapping = {
  password: {
    name: 'password',
    type: 'string',
    label: '密码',
    defaultValue: 'Changeit!123',
  },
  sysctlImage: {
    name: 'sysctlImage',
    type: 'boolean',
    label: 'sysctlImage',
    defaultValue: false,
  },
  virtualIp: {
    name: 'virtualIp',
    type: 'string',
    label: '虚拟IP',
  },
  slaveCount: {
    name: 'slaveCount',
    type: 'number',
    min: 3,
    step: 1,
    label: 'slaveCount',
    defaultValue: 3,
  },
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
    defaultValue: deployModeOptionsData[0].value,
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
    label: '应用名称',
    // defaultValue: `${middleWareData[0].value}-${uuidV1().substring(0, 5)}`,
    maxLength: 64,
  },
  pvc: {
    textField: 'name',
    valueField: 'name',
    name: 'pvcName',
    type: 'string',
    label: 'PVC',
  },
  values: {
    name: 'values',
    type: 'string',
    defaultValue: '',
  },
};

export {
  mapping, deployWayOptionsData, deployModeOptionsData, middleWareData, mySqlDeployModeOptionsData,
};

export default (projectId, HostSettingDataSet, BaseComDeployStore, ServiceVersionDataSet) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    if (key === 'serviceVersion') {
      item.options = ServiceVersionDataSet;
      // item.lookupAxiosConfig = () => ({
      //   url: BaseComDeployApis
      //     .getServiceVersionApi(middleWareData[0].value),
      //   method: 'get',
      //   transformResponse: (res) => {
      //     debugger;
      //     function finalFunc(data) {
      //       debugger;
      //       if (data.length && data.length > 0) {
      //         BaseComDeployStore.setServiceVersionList(data);
      //         // if (record) {
      //         //   record.set(mapping.serviceVersion.name, data[0].versionNumber);
      //         // }
      //       }
      //     }
      //     let newRes = res;
      //     try {
      //       debugger;
      //       newRes = JSON.parse(newRes);
      //       finalFunc(newRes);
      //       return newRes;
      //     } catch (e) {
      //       debugger;
      //       finalFunc(newRes);
      //       return newRes;
      //     }
      //   },
      // });
    } else if (key === 'password') {
      item.dynamicProps = {
        required: ({ record }) => (record
          .get(mapping.deployWay.name) === deployWayOptionsData[0].value),
      };
    } else if (key === 'sysctlImage') {
      item.dynamicProps = {
        required: ({ record }) => (record.get(mapping.middleware.name) === middleWareData[0].value)
          && (record.get(mapping.deployWay.name) === deployWayOptionsData[0].value),
      };
    } else if (key === 'slaveCount') {
      item.dynamicProps = {
        required: ({ record }) => (record.get(mapping.middleware.name) === middleWareData[0].value)
          && (record.get(mapping.deployWay.name) === deployWayOptionsData[0].value)
        && (record.get(mapping.deployMode.name) === deployModeOptionsData[1].value),
      };
    } else if (key === 'pvc') {
      item.dynamicProps = {
        lookupAxiosConfig: ({ record }) => (record.get(mapping.env.name) ? ({
          url: BaseComDeployApis.getPvcListApi(
            projectId,
            record.get(mapping.env.name),
          ),
          method: 'post',
          data: {
            params: [],
            searchParam: {
              status: 'Bound',
              used: 0,
            },
          },
        }) : undefined),
      };
    } else if (key === 'env') {
      item.lookupAxiosConfig = () => ({
        url: BaseComDeployApis.getEnvListApi(projectId),
        method: 'get',
        transformResponse: (res) => {
          let newRes = res;
          try {
            newRes = JSON.parse(newRes);
            BaseComDeployStore.setEnvList(newRes);
            return newRes;
          } catch (e) {
            BaseComDeployStore.setEnvList(newRes);
            return newRes;
          }
        },
      });
      item.dynamicProps = {
        required: ({ record }) => (record
          .get(mapping.deployWay.name) === deployWayOptionsData[0].value),
      };
    } else if (key === 'instance') {
      item.validator = (value, name, record) => checkName(value, name, record, projectId);
      item.dynamicProps = {
        required: ({ record }) => (record
          .get(mapping.deployWay.name) === deployWayOptionsData[0].value),
      };
      item.defaultValue = `${middleWareData[0].text}-${uuidV1().substring(0, 5)}`;
    } else if (key === 'resourceName') {
      item.dynamicProps = {
        required: ({ record }) => (record
          .get(mapping.deployWay.name) === deployWayOptionsData[1].value),
      };
      item.validator = (value, name, record) => {
        if (record.get(mapping.deployWay.name) === deployWayOptionsData[1].value) {
          return checkResourceName(value, name, record, projectId);
        }
        return true;
      };
      item.defaultValue = `${middleWareData[0].text}-${uuidV1().substring(0, 5)}`;
    } else if (key === 'virtualIp') {
      item.dynamicProps = {
        required: ({ record }) => record.get(mapping.middleware.name) === middleWareData[1].value
        && record.get(mapping.deployWay.name) === deployWayOptionsData[1].value
        && record.get(mapping.deployMode.name) === mySqlDeployModeOptionsData[1].value,
      };
      item.validator = (value, name, record) => {
        function isValidIP(ip) {
          const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
          return reg.test(ip);
        }
        const flag = record.get(mapping.middleware.name) === middleWareData[1].value
          && record.get(mapping.deployWay.name) === deployWayOptionsData[1].value
          && record.get(mapping.deployMode.name) === mySqlDeployModeOptionsData[1].value;
        if (!flag) {
          return true;
        }
        const result = isValidIP(value);
        if (result) {
          return result;
        }
        return '请输入正确格式的ip地址';
      };
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
            // mysql
            if (record.get(mapping.middleware.name) === middleWareData[1].value) {
              record.set(mapping.deployMode.name, mySqlDeployModeOptionsData[1].value);
            }
            // 单机
            if (record.get(mapping.deployMode.name) === deployModeOptionsData[0].value) {
              HostSettingDataSet.splice(0, HostSettingDataSet.records.length);
              if (record.get(mapping.middleware.name) === middleWareData[1].value) {
                //  mysql
                HostSettingDataSet.create({
                  checked: true,
                });
                HostSettingDataSet.records.forEach((i) => {
                  i.setState('params', new DataSet({
                    paging: false,
                    selection: false,
                    data: BaseComDeployStore.getMysqlParams,
                    fields: Object.keys(paramsMapping).map((key) => paramsMapping[key]),
                  }));
                });
              } else {
                // redis
                HostSettingDataSet.create();
              }
            } else {
              HostSettingDataSet.splice(0, HostSettingDataSet.records.length);
              if (record.get(mapping.middleware.name) === middleWareData[1].value) {
                HostSettingDataSet.create({
                  checked: true,
                });
                HostSettingDataSet.create({
                  checked: false,
                });
                HostSettingDataSet.records.forEach((i) => {
                  i.setState('params', new DataSet({
                    paging: false,
                    selection: false,
                    data: BaseComDeployStore.getMysqlParams,
                    fields: Object.keys(paramsMapping).map((key) => paramsMapping[key]),
                  }));
                });
              } else {
                HostSettingDataSet.create();
                HostSettingDataSet.create();
                HostSettingDataSet.create();
              }
            }
          }
          break;
        }
        case mapping.middleware.name:
          record.set(mapping.instance.name, `${middleWareData.find((i) => i.value === value).text}-${uuidV1().substring(0, 5)}`);
          record.set(mapping.resourceName.name, `${middleWareData.find((i) => i.value === value).text}-${uuidV1().substring(0, 5)}`);
          // 如果是mysql
          if (value === middleWareData[1].value) {
            record.getField(mapping.deployMode.name).options.loadData(mySqlDeployModeOptionsData);
            record.set(mapping.deployMode.name, mySqlDeployModeOptionsData[1].value);
            // 如果部署方式是容器部署
            if (record.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
              record.set(mapping.deployMode.name, mySqlDeployModeOptionsData[0].value);
            }
          } else {
            record.getField(mapping.deployMode.name).options.loadData(deployModeOptionsData);
            record.set(mapping.deployMode.name, deployModeOptionsData[1].value);
          }
          // 重查serviceVersion options
          // result = await BaseComDeployServices.axiosGetServiceVersion(value);
          // BaseComDeployStore.setServiceVersionList(result);
          // console.log(dataSet.current.getField(mapping.serviceVersion.name));
          // dataSet.current.getField(mapping.serviceVersion.name).options.splice(0, 1, result);
          break;
        case mapping.deployMode.name:
          // 如果是主机部署
          if (record.get(mapping.deployWay.name) === deployWayOptionsData[1].value) {
            if (value === deployModeOptionsData[0].value) {
              HostSettingDataSet.splice(0, HostSettingDataSet.records.length);
              if (record.get(mapping.middleware.name) === middleWareData[1].value) {
                //  mysql
                HostSettingDataSet.create({
                  checked: true,
                });
                HostSettingDataSet.records.forEach((i) => {
                  i.setState('params', new DataSet({
                    paging: false,
                    selection: false,
                    data: BaseComDeployStore.getMysqlParams,
                    fields: Object.keys(mapping).map((key) => mapping[key]),
                  }));
                });
              } else {
                // redis
                HostSettingDataSet.create();
              }
            } else {
              HostSettingDataSet.splice(0, HostSettingDataSet.records.length);
              if (record.get(mapping.middleware.name) === middleWareData[1].value) {
                HostSettingDataSet.create({
                  checked: true,
                });
                HostSettingDataSet.create({
                  checked: false,
                });
                HostSettingDataSet.records.forEach((i) => {
                  i.setState('params', new DataSet({
                    paging: false,
                    selection: false,
                    data: BaseComDeployStore.getMysqlParams,
                    fields: Object.keys(mapping).map((key) => mapping[key]),
                  }));
                });
              } else {
                HostSettingDataSet.create();
                HostSettingDataSet.create();
                HostSettingDataSet.create();
              }
            }
          } else {
            //  如果是环境部署
            // const deployMode = value;
            // const serviceVersion = record.get(mapping.serviceVersion.name);
            // const lookupData = BaseComDeployStore.getServiceVersionList;
            // const appVersionId = lookupData
            //   .find((item) => item.versionNumber === serviceVersion).id;
            // const result = await BaseComDeployServices
            //   .axiosGetMiddlewareValue(appVersionId, deployMode);
            // record.set(mapping.values.name, result || '');
          }
          break;
        case mapping.serviceVersion.name: {
          // if (record.get(mapping.deployWay.name) === deployWayOptionsData[0].value) {
          //   const deployMode = record.get(mapping.deployMode.name);
          //   const lookupData = BaseComDeployStore.getServiceVersionList;
          //   const appVersionId = lookupData.find((item) => item.versionNumber === value).id;
          //   const result = await BaseComDeployServices
          //     .axiosGetMiddlewareValue(appVersionId, deployMode);
          //   record.set(mapping.values.name, result || '');
          // }
          break;
        }
        default:
          break;
      }
    },
  },
});
