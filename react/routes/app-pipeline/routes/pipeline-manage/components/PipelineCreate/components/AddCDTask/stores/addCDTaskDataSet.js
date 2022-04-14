/* eslint-disable import/no-anonymous-default-export */
import uuidV1 from 'uuid';
import { axios, apiTestApiConfig } from '@choerodon/master';
import forEach from 'lodash/forEach';
import JSONbig from 'json-bigint';
import { DataSet } from 'choerodon-ui/pro';
import addCDTaskDataSetMap, {
  fieldMap,
  typeData,
  deployWayData,
  relativeObjData,
  productTypeData,
} from './addCDTaskDataSetMap';
import { appNameDataSet } from './deployGroupDataSet';
import { appNameChartDataSet } from './deployChartDataSet';

async function initValueIdDataSet(dataSet, appServiceId, envId, createValueRandom, afterFun) {
  dataSet.setQueryParameter('data', {
    appServiceId,
    envId,
    random: Math.random(),
    createValueRandom,
  });
  const res = await dataSet.query();
  if (afterFun) {
    afterFun(res);
  }
}

function getDefaultInstanceName(appServiceCode) {
  return appServiceCode
    ? `${appServiceCode.substring(0, 24)}-${uuidV1().substring(0, 5)}`
    : uuidV1().substring(0, 30);
}

async function checkName(value, projectId, record) {
  if (!record?.get('envId')) {
    return true;
  }
  if (!(record?.get('type') === 'cdDeploy' && record?.get('deployType') === 'create')) {
    return true;
  }
  try {
    const res = await axios.get(
      `/devops/v1/projects/${projectId}/app_service_instances/check_name?env_id=${record?.get(
        'envId',
      )}&instance_name=${value}`,
    );
    if ((res && res.failed) || !res) {
      return '格式有误';
    }
    return true;
  } catch (err) {
    return '校验失败';
  }
}

export default (
  projectId,
  PipelineCreateFormDataSet,
  organizationId,
  useStore,
  appServiceCode,
  random,
  valueIdDataSet,
  trueAppServiceId,
  appServiceId,
  jobDetail,
  HotJarOptionsDataSet,
) => ({
  autoCreate: true,
  fields: [
    {
      name: 'type',
      type: 'string',
      label: '任务类型',
      required: true,
      defaultValue: 'cdDeploy',
    },
    {
      name: 'name',
      type: 'string',
      label: '任务名称',
      required: true,
      maxLength: 30,
    },
    {
      name: 'glyyfw',
      type: 'string',
      label: '关联应用服务',
      required: true,
      disabled: true,
    },
    {
      name: addCDTaskDataSetMap.apiTestMission,
      type: 'string',
      label: 'API测试任务',
      textField: 'name',
      valueField: 'id',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === addCDTaskDataSetMap.apiTest
        && record?.get(fieldMap.relativeObj.name) === relativeObjData[0].value,
      },
      options: new DataSet({
        autoQuery: true,
        paging: true,
        transport: {
          read: ({ data }) => {
            const { id } = data;
            return ({
              method: 'get',
              url: `/test/v1/projects/${projectId}/api_test/tasks/paging?random=${random}${id ? `&id=${id}` : ''}`,
              transformResponse: (res) => {
                let newRes = res;
                try {
                  newRes = JSON.parse(res);
                  useStore.setApiTestArray(newRes.content);
                  return newRes;
                } catch (e) {
                  return newRes;
                }
              },
            });
          },
        },
      }),
    },
    {
      name: 'apiTestConfigId',
      type: 'string',
      label: '任务配置',
      textField: 'name',
      valueField: 'id',
      options: new DataSet({
        autoQuery: true,
        transport: {
          read: () => ({
            ...apiTestApiConfig.getConfigList(),
            params: undefined,
          }),
        },
      }),
    },
    {
      name: addCDTaskDataSetMap.relativeMission,
      type: 'string',
      label: '关联部署任务',
    },
    {
      name: 'triggerType',
      type: 'string',
      label: '匹配类型',
      required: true,
      defaultValue: 'refs',
    },
    {
      name: 'envId',
      type: 'string',
      label: '环境名称',
      textField: 'name',
      valueField: 'id',
      dynamicProps: {
        required: ({ record }) => [typeData[0].value, typeData[1].value, 'cdDeploy'].includes(record?.get('type')),
      },
      lookupAxiosConfig: () => ({
        method: 'get',
        url: `/devops/v1/projects/${projectId}/envs/list_by_active?active=true&random=${random}`,
        transformResponse: (res) => {
          let newRes = res;
          try {
            newRes = JSONbig.parse(res);
            useStore.setValueIdList(newRes.filter((r) => r.permission));
            return newRes.filter((r) => r.permission);
          } catch (e) {
            return newRes;
          }
        },
      }),
    },
    {
      name: addCDTaskDataSetMap.triggersTasks.name,
      type: 'boolean',
      label: '是否允许非环境人员触发此部署任务',
      defaultValue: addCDTaskDataSetMap.triggersTasks.values[0],
    },
    {
      // name: 'bsms',
      name: 'deployType',
      type: 'string',
      label: '部署模式',
      defaultValue: 'create',
    },
    {
      name: 'instanceName',
      type: 'string',
      label: '实例名称',
      validator: (value, name, record) => checkName(value, projectId, record),
      // dynamicProps: {
      //   required: ({ record }) => record?.get('type') === 'cdDeploy'
      //     && record?.get('deployType') === 'create',
      // },
      defaultValue: getDefaultInstanceName(appServiceCode),
    },
    {
      name: 'instanceId',
      type: 'string',
      label: '选择要替换的实例',
      textField: 'code',
      valueField: 'id',
      dynamicProps: {
        // required: ({ record }) => record?.get('deployType') === 'update',
        disabled: ({ record }) => !record?.get('envId'),
        lookupAxiosConfig: ({ record }) => ({
          method: 'get',
          url:
            record?.get('envId')
            && `/devops/v1/projects/${projectId}/app_service_instances/list_running_and_failed?app_service_id=${appServiceId}&env_id=${record?.get('envId')}&random=${random}`,
          transformResponse: (res) => {
            let newRes = res;
            try {
              newRes = JSONbig.parse(newRes);
              useStore.setInstanceList(newRes);
              return newRes;
            } catch (e) {
              return newRes;
            }
          },
        }),
      },
    },
    {
      name: 'valueId',
      type: 'string',
      label: '部署配置',
      textField: 'name',
      valueField: 'id',
      dynamicProps: {
        // required: ({ record }) => record?.get('type') === 'cdDeploy',
        disabled: ({ record }) => !record?.get('envId'),
        lookupAxiosConfig: ({ record }) => ({
          method: 'get',
          url:
            record?.get('envId')
            && `/devops/v1/projects/${projectId}/deploy_value/list_by_env_and_app?app_service_id=${appServiceId}&env_id=${record?.get('envId')}&random=${random}&createValueRandom=${useStore.getValueIdRandom}`,
          transformResponse: (res) => {
            let newRes = res;
            try {
              newRes = JSON.parse(res);
              newRes.push({
                name: '创建部署配置',
                id: 'create',
              });
              useStore.setValueIdList(newRes);
              return newRes;
            } catch (e) {
              newRes.push({
                name: '创建部署配置',
                id: 'create',
              });
              useStore.setValueIdList(newRes);
              return newRes;
            }
          },
        }),
      },
    },
    {
      name: addCDTaskDataSetMap.hostSource,
      type: 'string',
      label: '主机来源',
      defaultValue: addCDTaskDataSetMap.alreadyhost,
    },
    {
      name: addCDTaskDataSetMap.host,
      type: 'string',
      label: '主机',
      textField: 'name',
      valueField: 'id',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost',
      },
      lookupAxiosConfig: ({ params }) => {
        const data = params?.['search_param'];
        return ({
          method: 'post',
          url: `/devops/v1/projects/${projectId}/hosts/page_by_options?random=${random}`,
          data: {
            searchParam: {
              type: 'deploy',
            },
            params: [data],
          },
          transformResponse: (res) => {
            let newRes = res;
            try {
              newRes = JSONbig.parse(newRes);
              newRes.content = newRes.content.map((i) => ({
                ...i,
                connect: i.hostStatus === 'connected',
              }));
              useStore.setHostList(newRes.content);
              return newRes;
            } catch (e) {
              return newRes;
            }
          },
        });
      },
    },
    {
      name: 'hostIp',
      type: 'string',
      label: 'IP',
      dynamicProps: {
        disabled: ({ record }) => record?.get(addCDTaskDataSetMap.hostSource)
          === addCDTaskDataSetMap.alreadyhost,
        // required: ({ record }) => record?.get('type') === 'cdHost',
      },
    },
    {
      name: 'hostPort',
      type: 'string',
      label: '端口',
      dynamicProps: {
        disabled: ({ record }) => record?.get(addCDTaskDataSetMap.hostSource)
          === addCDTaskDataSetMap.alreadyhost,
        // required: ({ record }) => record?.get('type') === 'cdHost',
      },
    },
    {
      name: 'authType',
      type: 'string',
      label: '账号配置',
      defaultValue: 'accountPassword',
    },
    {
      name: 'username',
      type: 'string',
      label: '用户名',
    },
    {
      name: 'password',
      type: 'string',
      label: '密码',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('authType') === 'accountPassword' && record?.get(addCDTaskDataSetMap.hostSource) === addCDTaskDataSetMap.customhost,
      },
    },
    {
      name: 'hostDeployType',
      type: 'string',
      label: '部署模式',
      defaultValue: 'jar',
    },
    {
      name: 'deploySource',
      type: 'string',
      disabled: true,
      label: '部署来源',
      defaultValue: 'matchDeploy',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost'
          && (record?.get('hostDeployType') === 'image'
            || ['jar', 'docker'].includes(record?.get('hostDeployType'))),
      },
    },
    {
      name: 'workingPath',
      type: 'string',
      label: '工作目录',
      defaultValue: './',
    },
    {
      name: 'appInstanceName',
      type: 'string',
      label: '应用实例名称',
      maxLength: 64,
    },
    {
      name: 'pipelineTask',
      type: 'string',
      label: '关联构建任务',
      textField: 'pipelineTask',
      valueField: 'pipelineTask',
      dynamicProps: {
        required: ({ record }) => (record?.get('type') === 'cdHost'
          && ((record?.get('hostDeployType') === 'image'
            && record?.get('deploySource') === 'pipelineDeploy')
            || ['jar', 'docker'].includes(record?.get('hostDeployType'))
              && record?.get('deploySource') === 'pipelineDeploy')) || (
          (record?.get('type') === 'cdHost') && (record?.get('hostDeployType') === 'docker_compose')
        ),
      },
    },
    {
      name: 'repoId',
      type: 'string',
      label: '项目镜像仓库',
      textField: 'repoName',
      valueField: 'repoId',
      lookupAxiosConfig: () => ({
        method: 'get',
        url: `/rdupm/v1/harbor-choerodon-repos/listImageRepo?projectId=${projectId}`,
        transformResponse: (data) => {
          let newData = data;
          try {
            newData = JSON.parse(newData);
            useStore.setRepoList(newData);
            return newData;
          } catch (e) {
            useStore.setRepoList(newData);
            return newData;
          }
        },
      }),
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'image'
          && record?.get('deploySource') === 'matchDeploy',
      },
    },
    {
      name: 'imageId',
      type: 'string',
      label: '镜像',
      textField: 'imageName',
      valueField: 'imageId',
      dynamicProps: {
        disabled: ({ record }) => !record?.get('repoId'),
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'image'
          && record?.get('deploySource') === 'matchDeploy',
        lookupAxiosConfig: ({ record }) => ({
          method: 'get',
          url:
            record?.get('repoId')
            && `rdupm/v1/harbor-choerodon-repos/listHarborImage?repoId=${record?.get(
              'repoId',
            )}&repoType=${(function () {
              const { lookup } = record?.getField('repoId');
              return lookup?.find(
                (l) => String(l.repoId) === String(record?.get('repoId'))
              )?.repoType;
            }())}`,
          transformResponse: (data) => {
            let newData = data;
            try {
              newData = JSON.parse(newData);
              useStore.setImageList(newData);
              return newData;
            } catch (e) {
              useStore.setImageList(newData);
              return newData;
            }
          },
        }),
      },
    },
    {
      name: 'matchType',
      type: 'string',
      label: '匹配类型',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'image'
          && record?.get('deploySource') === 'matchDeploy',
      },
    },
    {
      name: 'matchContent',
      type: 'string',
      label: '镜像版本匹配',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'image'
          && record?.get('deploySource') === 'matchDeploy',
      },
    },
    {
      name: 'containerName',
      type: 'string',
      label: '容器名称',
      required: true,
      dynamicProps: {
        required: ({ record }) => (
            record?.get('type') === 'cdHost'
            && ['docker', 'image'].includes(record?.get('hostDeployType'))
            && ((record?.get('deploySource') === 'matchDeploy'
              || record?.get('deploySource') === 'pipelineDeploy')
            || (record?.get('deploySource') === 'pipelineDeploy'
              || record?.get('hostDeployType') === 'docker'))
        ),
      },
    },
    {
      name: 'serverName',
      type: 'string',
      label: 'Nexus服务',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'jar'
          && record?.get('deploySource') === 'matchDeploy',
      },
      textField: 'serverName',
      valueField: 'configId',
      lookupAxiosConfig: () => ({
        method: 'get',
        url: `/devops/v1/nexus/choerodon/${organizationId}/project/${projectId}/nexus/server/list`,
      }),
    },
    {
      name: 'repositoryId',
      type: 'string',
      label: '项目制品库',
      textField: 'neRepositoryName',
      valueField: 'repositoryId',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'jar'
          && record?.get('deploySource') === 'matchDeploy',
        disabled: ({ record }) => !record?.get('serverName'),
        lookupAxiosConfig: ({ record }) => ({
          method: 'get',
          url:
            record?.get('serverName')
            && `rdupm/v1/nexus-repositorys/choerodon/${organizationId}/project/${projectId}/repo/maven/list?configId=${record?.get(
              'serverName',
            )}`,
        }),
      },
    },
    {
      name: 'groupId',
      type: 'string',
      label: 'groupID',
      textField: 'name',
      valueField: 'value',
      dynamicProps: {
        disabled: ({ record }) => !record?.get('repositoryId'),
        lookupAxiosConfig: ({ record }) => ({
          method: 'get',
          url:
            record?.get('repositoryId')
            && `/rdupm/v1/nexus-repositorys/choerodon/${organizationId}/project/${projectId}/repo/maven/groupId?repositoryId=${record?.get(
              'repositoryId',
            )}`,
          transformResponse: (data) => {
            try {
              const array = JSON.parse(data);
              return array.map((i) => ({
                value: i,
                name: i,
              }));
            } catch (e) {
              return data;
            }
          },
        }),
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'jar'
          && record?.get('deploySource') === 'matchDeploy',
      },
    },
    {
      name: 'artifactId',
      type: 'string',
      label: 'artifactID',
      textField: 'name',
      valueField: 'value',
      dynamicProps: {
        disabled: ({ record }) => !record?.get('repositoryId'),
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'jar'
          && record?.get('deploySource') === 'matchDeploy',
        lookupAxiosConfig: ({ record }) => ({
          method: 'get',
          url:
            record?.get('repositoryId')
            && `/rdupm/v1/nexus-repositorys/choerodon/${organizationId}/project/${projectId}/repo/maven/artifactId?repositoryId=${record?.get(
              'repositoryId',
            )}`,
          transformResponse: (data) => {
            try {
              const array = JSON.parse(data);

              return array.map((i) => ({
                value: i,
                name: i,
              }));
            } catch (e) {
              return data;
            }
          },
        }),
      },
    },
    {
      name: 'versionRegular',
      type: 'string',
      label: 'jar包版本正则匹配',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdHost'
          && record?.get('hostDeployType') === 'jar'
          && record?.get('deploySource') === 'matchDeploy',
      },
    },
    {
      name: 'triggerValue',
      type: 'string',
      label: '触发分支',
    },
    {
      name: addCDTaskDataSetMap.pipelineCallbackAddress,
      type: 'string',
      label: '流水线回调地址',
      required: false,
      disabled: true,
    },
    {
      name: addCDTaskDataSetMap.externalAddress,
      type: 'string',
      label: '外部地址',
      required: true,
      dynamicProps: {
        required: ({ record }) => record?.get('type') === addCDTaskDataSetMap.externalStuck,
      },
    },
    {
      name: addCDTaskDataSetMap.externalToken,
      type: 'string',
      label: 'Token',
    },
    {
      name: addCDTaskDataSetMap.missionDes,
      type: 'string',
      label: '任务描述',
      maxLength: 100,
    },
    {
      name: 'pageSize',
      type: 'number',
      defaultValue: 20,
    },
    {
      name: 'cdAuditUserIds',
      type: 'object',
      label: '审核人员',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdAudit',
      },
      textField: 'realName',
      multiple: true,
      valueField: 'id',
      options: new DataSet({
        autoQuery: false,
        paging: true,
        pageSize: 10,
        transport: {
          read: ({ dataSet, data, params }) => {
            const realName = data?.realName;
            const cdAuditIdsArrayObj = jobDetail?.cdAuditUserIds || [];
            let cdAuditIds = [];
            forEach(cdAuditIdsArrayObj, (obj) => {
              if (typeof obj === 'string') {
                cdAuditIds.push(obj);
              } else if (typeof obj === 'object') {
                cdAuditIds.push(obj?.id);
              }
            });
            if (realName && data.id) {
              cdAuditIds = [...cdAuditIds, data.id];
            }
            if (data?.ids) {
              cdAuditIds = [...cdAuditIds || [], ...data?.ids];
            }
            return {
              method: 'post',
              url: `/devops/v1/projects/${projectId}/users/app_services/${appServiceId}`,
              data: {
                userName: realName || '',
                ids: [...new Set(cdAuditIds)] || [],
              },
              transformResponse: (res) => {
                let newRes;
                try {
                  newRes = JSON.parse(res);
                  if (
                    newRes.totalElements % 20 === 0
                    && newRes.content.length !== 0
                  ) {
                    newRes.content.push({
                      id: 'more',
                      realName: '加载更多',
                    });
                  }
                  return newRes;
                } catch (e) {
                  return res;
                }
              },
            };
          },
        },
      }),
    },
    {
      name: 'countersigned',
      type: 'number',
      label: '审核模式',
      dynamicProps: {
        required: ({ record }) => record?.get('type') === 'cdAudit'
          && record?.get('cdAuditUserIds')?.length > 1,
      },
    },
    {
      name: addCDTaskDataSetMap.whetherBlock,
      type: 'boolean',
      label: '执行成功率低于阈值后是否阻塞',
      defaultValue: true,
    },
    {
      name: addCDTaskDataSetMap.alarm,
      type: 'boolean',
      label: '是否启用告警设置',
      defaultValue: false,
    },
    {
      name: addCDTaskDataSetMap.threshold,
      type: 'string',
      label: '执行阈值',
      dynamicProps: {
        required: ({ record }) => record?.get(addCDTaskDataSetMap.alarm),
        disabled: ({ record }) => !record?.get(addCDTaskDataSetMap.alarm),
      },
    },
    {
      name: addCDTaskDataSetMap.notifyObject,
      type: 'string',
      label: '通知对象',
      dynamicProps: {
        required: ({ record }) => record?.get(addCDTaskDataSetMap.alarm),
        disabled: ({ record }) => !record?.get(addCDTaskDataSetMap.alarm),
      },
      textField: 'realName',
      valueField: 'id',
      multiple: true,
      lookupAxiosConfig: {
        url: `/iam/choerodon/v1/projects/${projectId}/users?page=0&size=20`,
        method: 'get',
      },
    },
    {
      name: addCDTaskDataSetMap.notifyWay,
      type: 'string',
      label: '通知方式',
      multiple: ',',
      dynamicProps: {
        disabled: ({ record }) => !record?.get(addCDTaskDataSetMap.alarm),
      },
    },
    {
      ...fieldMap.deployWay,
    },
    {
      ...fieldMap.productType,
    },
    {
      ...fieldMap.preCommand,
    },
    {
      ...fieldMap.runCommand,
    },
    {
      ...fieldMap.postCommand,
    },
    {
      ...fieldMap.relativeObj,
    },
    {
      ...fieldMap.kits,
      options: new DataSet({
        autoQuery: true,
        transport: {
          read: () => ({
            ...apiTestApiConfig.getSuitesList(),
          }),
        },
      }),
    },
    {
      ...fieldMap.dockerCompose,
    },
    {
      ...fieldMap.dockerComposeRunCommand,
    },
  ],
  events: {
    load: ({ dataSet }) => {
      const record = dataSet?.current;
      if (record?.get('cdAuditUserIds') && record?.get('cdAuditUserIds')?.length > 0) {
        dataSet?.getField('cdAuditUserIds')?.options.query(0, {
          ids: record?.get('cdAuditUserIds'),
        });
      }
    },
    create: ({ dataSet }) => {
      if (!jobDetail) {
        dataSet?.getField('cdAuditUserIds')?.options.query();
        HotJarOptionsDataSet.query();
      }
    },
    update: ({ name, value, record }) => {
      switch (name) {
        case 'envId': {
          if (record?.get('type') === typeData[0].value) {
            initValueIdDataSet(
              valueIdDataSet,
              appServiceId,
              value,
              useStore.getValueIdRandom,
            );
            initValueIdDataSet(
              appNameChartDataSet,
              appServiceId,
              value,
            );
          }
          if (value) {
            appNameDataSet.setQueryParameter('data', value);
            appNameDataSet.query();
          }
          break;
        }
        case fieldMap.productType.name: {
          if (record?.get('type') === 'cdHost') {
            if (value === productTypeData[3].value) {
              record?.getField(fieldMap.deployWay.name).set('disabled', true);
              record?.set(fieldMap.deployWay.name, deployWayData[1].value);
            } else if (record?.getField(fieldMap.deployWay.name).get('disabled')) {
                record?.getField(fieldMap.deployWay.name).set('disabled', false);
            }
            HotJarOptionsDataSet.setQueryParameter('data', value);
            HotJarOptionsDataSet.query();
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

export { initValueIdDataSet };
