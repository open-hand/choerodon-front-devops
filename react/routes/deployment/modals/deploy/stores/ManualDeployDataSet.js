import omit from 'lodash/omit';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import uuidV1 from 'uuid/v1';
import { axios } from '@choerodon/boot';
import isEmpty from 'lodash/isEmpty';
import JSONbig from 'json-bigint';

const mapping = {
  deployWay: {
    value: 'deployType',
    options: [{
      value: 'env',
      label: '环境部署',
    }, {
      value: 'host',
      label: '主机部署',
    }],
  },
  hostName: {
    value: 'hostId',
  },
  ip: {
    value: 'hostIp',
  },
  port: {
    value: 'hostPort',
  },
  deployObject: {
    value: 'deployObjectType',
    options: [{
      value: 'image',
      label: 'Docker镜像',
    }, {
      value: 'jar',
      label: 'jar应用',
    }],
  },
  projectImageRepo: {
    value: 'repoId',
  },
  image: {
    value: 'imageId',
  },
  imageVersion: {
    value: 'tag',
  },
  containerName: {
    value: 'containerName',
  },
  nexus: {
    value: 'serverName',
  },
  projectProduct: {
    value: 'repositoryId',
  },
  groupId: {
    value: 'groupId',
  },
  artifactId: {
    value: 'artifactId',
  },
  jarVersion: {
    value: 'version',
  },
  workPath: {
    value: 'workingPath',
  },
};

function getRandomName(prefix = '') {
  const randomString = uuidV1();
  const realPrefix = prefix.split('_')[1] || prefix.split('_')[0];

  return realPrefix
    ? `${realPrefix.substring(0, 24)}-${randomString.substring(0, 5)}`
    : randomString.substring(0, 30);
}

function formatAnnotation(postData, oldAnnotation = []) {
  const annotations = {};
  forEach(oldAnnotation, ({ domain, key, value }) => {
    if (key && value) {
      annotations[`${domain ? `${domain}/` : ''}${key}`] = value;
    }
  });
  // eslint-disable-next-line no-param-reassign
  postData.annotations = isEmpty(annotations) ? null : annotations;
}

export { mapping };

export default (({
  intlPrefix,
  formatMessage,
  projectId,
  envOptionsDs,
  valueIdOptionsDs,
  versionOptionsDs,
  deployStore,
  networkDs,
  domainDs,
  organizationId,
  deployUseStore,
}) => {
  function handleCreate({ dataSet, record }) {
    deployStore.loadAppService(projectId, record.get('appServiceSource'));
  }

  function handleUpdate({
    dataSet, record, name, value,
  }) {
    const networkRecord = record.getCascadeRecords('devopsServiceReqVO')[0];
    const domainRecord = record.getCascadeRecords('devopsIngressVO')[0];
    switch (name) {
      case 'appServiceSource':
        deployStore.setAppService([]);
        deployStore.loadAppService(projectId, value);
        record.get('appServiceId') && record.set('appServiceId', null);
        break;
      case 'environmentId':
        record.getField('instanceName').checkValidity();
        loadValueList(record);
        networkRecord.getField('name').checkValidity();
        domainRecord.getField('name').checkValidity();
        forEach(domainRecord.getCascadeRecords('pathList'), (pathRecord) => {
          pathRecord.getField('path').checkValidity();
        });
        domainRecord.get('certId') && domainRecord.set('certId', null);
        domainRecord.getField('certId').fetchLookup();
        break;
      case 'appServiceId':
        record.get('appServiceVersionId') && record.set('appServiceVersionId', null);
        record.getField('appServiceVersionId').reset();
        if (value) {
          record.getField('appServiceVersionId').set('lookupAxiosConfig', {
            url: `/devops/v1/projects/${projectId}/app_service_versions/page_by_options?app_service_id=${value.split('**')[0]}&deploy_only=true&do_page=true&page=1&size=40`,
            method: 'post',
          });
          record.set('instanceName', getRandomName(value.split('**')[1]));
        }
        loadValueList(record);
        break;
      case 'appServiceVersionId':
        if (!record.get('valueId')) {
          value && deployStore.loadDeployValue(projectId, value);
          !value && deployStore.setConfigValue('');
        }
        break;
      case 'valueId':
        if (value) {
          deployStore.loadConfigValue(projectId, value);
        } else if (record.get('appServiceVersionId')) {
          deployStore.loadDeployValue(projectId, record.get('appServiceVersionId'));
        } else {
          deployStore.setConfigValue('');
        }
        break;
      default:
        break;
    }
  }

  function loadValueList(record) {
    if (record.get('environmentId') && record.get('appServiceId')) {
      // eslint-disable-next-line no-param-reassign
      valueIdOptionsDs.transport.read.url = `/devops/v1/projects/${projectId}/deploy_value/list_by_env_and_app?env_id=${record.get('environmentId')}&app_service_id=${record.get('appServiceId').split('**')[0]}`;
      valueIdOptionsDs.query();
    } else {
      valueIdOptionsDs.removeAll();
    }
    record.set('valueId', null);
  }

  async function checkName(value, name, record) {
    if (record.get(mapping.deployWay.value)
      === mapping.deployWay.options[0].value) {
      const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
      if (value && pa.test(value)) {
        if (!record.get('environmentId')) return;
        try {
          const res = await axios.get(`/devops/v1/projects/${projectId}/app_service_instances/check_name?instance_name=${value}&env_id=${record.get('environmentId')}`);
          if ((res && res.failed) || !res) {
            // eslint-disable-next-line consistent-return
            return formatMessage({ id: 'checkNameExist' });
          }
          // eslint-disable-next-line consistent-return
          return true;
        } catch (err) {
          // eslint-disable-next-line consistent-return
          return formatMessage({ id: 'checkNameFailed' });
        }
      } else {
        // eslint-disable-next-line consistent-return
        return formatMessage({ id: 'checkCodeReg' });
      }
    }
    // eslint-disable-next-line consistent-return
    return true;
  }

  return ({
    autoCreate: true,
    autoQuery: false,
    paging: false,
    children: {
      devopsServiceReqVO: networkDs,
      devopsIngressVO: domainDs,
    },
    transport: {
      create: ({ data: [data] }) => {
        // 如果是环境部署
        if (data[mapping.deployWay.value] === mapping.deployWay.options[0].value) {
          const res = omit(data, ['__id', '__status', 'appServiceSource']);
          const appServiceId = data.appServiceId.split('**')[0];
          res.appServiceId = appServiceId;
          if (data.devopsServiceReqVO[0] && data.devopsServiceReqVO[0].name) {
            const newPorts = map(data.devopsServiceReqVO[0].ports, ({
              port, targetPort, nodePort, protocol,
            }) => ({
              port: Number(port),
              targetPort: Number(targetPort),
              nodePort: nodePort ? Number(nodePort) : null,
              protocol: data.devopsServiceReqVO[0].type === 'NodePort' ? protocol : null,
            }));
            // eslint-disable-next-line no-param-reassign
            data.devopsServiceReqVO[0].ports = newPorts;
            // eslint-disable-next-line prefer-destructuring
            res.devopsServiceReqVO = data.devopsServiceReqVO[0];
            const { externalIp } = res.devopsServiceReqVO;
            res.devopsServiceReqVO.externalIp = externalIp && externalIp.length ? externalIp.join(',') : null;
            res.devopsServiceReqVO.targetInstanceCode = data.instanceName;
            res.devopsServiceReqVO.envId = data.environmentId;
          } else {
            res.devopsServiceReqVO = null;
          }
          if (data.devopsIngressVO[0] && data.devopsIngressVO[0].name) {
            // eslint-disable-next-line prefer-destructuring
            res.devopsIngressVO = data.devopsIngressVO[0];
            res.devopsIngressVO.envId = data.environmentId;
            res.devopsIngressVO.appServiceId = appServiceId;
            formatAnnotation(res.devopsIngressVO, data.devopsIngressVO[0].annotations);
          } else {
            res.devopsIngressVO = null;
          }
          return ({
            url: `/devops/v1/projects/${projectId}/app_service_instances`,
            method: 'post',
            data: res,
          });
        }
        // 如果是主机部署
        const res = {};
        res.hostConnectionVO = {
          [mapping.hostName.value]: data[mapping.hostName.value],
          [mapping.ip.value]: data[mapping.ip.value],
          [mapping.port.value]: data[mapping.port.value],
        };
        const deployObject = data[mapping.deployObject.value];
        // 如果部署对象是Docker镜像
        if (deployObject === mapping.deployObject.options[0].value) {
          res.imageDeploy = {
            [mapping.projectImageRepo.value]: data[mapping.projectImageRepo.value],
            [mapping.image.value]: data[mapping.image.value],
            [mapping.imageVersion.value]: data[mapping.imageVersion.value],
            [mapping.containerName.value]: data[mapping.containerName.value],
            value: deployUseStore.getImageYaml,
          };
        } else {
          //  如果部署对象是jar应用
          res.jarDeploy = {
            [mapping.nexus.value]: data[mapping.nexus.value],
            [mapping.projectProduct.value]: data[mapping.projectProduct.value],
            [mapping.groupId.value]: data[mapping.groupId.value],
            [mapping.artifactId.value]: data[mapping.artifactId.value],
            [mapping.jarVersion.value]: data[mapping.jarVersion.value],
            [mapping.workPath.value]: data[mapping.workPath.value],
            value: deployUseStore.getJarYaml,
          };
        }
        return ({
          url: `/devops/v1/projects/${projectId}/deploy/host`,
          method: 'post',
          data: res,
        });
      },
    },
    fields: [
      {
        name: mapping.deployWay.value,
        type: 'string',
        label: '部署方式',
        defaultValue: mapping.deployWay.options[0].value,
      },
      {
        name: mapping.hostName.value,
        type: 'string',
        label: '主机名称',
        textField: 'name',
        valueField: 'id',
        lookupAxiosConfig: () => ({
          method: 'post',
          url: `/devops/v1/projects/${projectId}/hosts/page_by_options`,
          data: {
            searchParam: {
              type: 'deploy',
            },
            params: [],
          },
          transformResponse: (res) => {
            let newRes = res;
            try {
              newRes = JSONbig.parse(newRes);
              return newRes;
            } catch (e) {
              return newRes;
            }
          },
        }),
      },
      {
        name: mapping.ip.value,
        type: 'string',
        label: 'IP',
        disabled: true,
        dynamicProps: {
          required: ({ record }) => record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value,
        },
      },
      {
        name: mapping.port.value,
        type: 'string',
        label: '端口',
        disabled: true,
        dynamicProps: {
          required: ({ record }) => record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value,
        },
      },
      {
        name: mapping.deployObject.value,
        type: 'string',
        label: '部署对象',
        defaultValue: mapping.deployObject.options[0].value,
      },
      {
        name: mapping.projectImageRepo.value,
        type: 'string',
        label: '项目镜像仓库',
        textField: 'repoName',
        valueField: 'repoId',
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
          && (record.get(mapping.deployObject.value) === mapping.deployObject.options[0].value),
        },
        lookupAxiosConfig: () => ({
          method: 'get',
          url: `/rdupm/v1/harbor-choerodon-repos/listImageRepo?projectId=${projectId}`,
          transformResponse: (data) => {
            let newData = data;
            try {
              newData = JSON.parse(newData);
              return newData;
            } catch (e) {
              return newData;
            }
          },
        }),
      },
      {
        name: mapping.image.value,
        type: 'string',
        label: '镜像',
        textField: 'imageName',
        valueField: 'imageId',
        dynamicProps: {
          disabled: ({ record }) => !record.get(mapping.projectImageRepo.value),
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[0].value),
          lookupAxiosConfig: ({ record }) => ({
            method: 'get',
            url:
              record.get(mapping.projectImageRepo.value)
              && `rdupm/v1/harbor-choerodon-repos/listHarborImage?repoId=${record.get(
                mapping.projectImageRepo.value,
              )}&repoType=${(function () {
                const { lookup } = record.getField(mapping.projectImageRepo.value);
                return lookup?.find(
                  (l) => String(l.repoId) === String(record.get(mapping.projectImageRepo.value))
                )?.repoType;
              }())}`,
            transformResponse: (data) => {
              let newData = data;
              try {
                newData = JSON.parse(newData);
                return newData;
              } catch (e) {
                return newData;
              }
            },
          }),
        },
      },
      {
        name: mapping.imageVersion.value,
        type: 'string',
        label: '镜像版本',
        textField: 'tagName',
        valueField: 'tagName',
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[0].value),
          disabled: ({ record }) => !record.get(mapping.image.value),
          lookupAxiosConfig: ({ record }) => ({
            method: 'get',
            url:
              record.get(mapping.projectImageRepo.value)
              && record.get(mapping.image.value)
              && `rdupm/v1/harbor-image-tag/list/${projectId}?page=0&size=10&repoName=${(function () {
                const projectImageRepo = record.get(mapping.projectImageRepo.value);
                const projectImageRepoLookup = record.getField(
                  mapping.projectImageRepo.value,
                ).lookup;
                const image = record.get(mapping.image.value);
                const imageLookup = record.getField(mapping.image.value).lookup;
                const { repoName } = projectImageRepoLookup
                  .find((l) => l.repoId === projectImageRepo);
                const { imageName } = imageLookup.find((l) => l.imageId === image);
                return `${repoName}/${imageName}`;
              }())}`,
            transformResponse: (data) => {
              let newData = data;
              try {
                newData = JSON.parse(newData);
                return newData;
              } catch (e) {
                return newData;
              }
            },
          }),
        },
      },
      {
        name: mapping.containerName.value,
        type: 'string',
        label: '容器名称',
        required: true,
        maxLength: 30,
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[0].value),
        },
      },
      {
        name: mapping.nexus.value,
        type: 'string',
        label: 'Nexus服务',
        textField: 'serverName',
        valueField: 'configId',
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[1].value),
        },
        lookupAxiosConfig: () => ({
          method: 'get',
          url: `/devops/v1/nexus/choerodon/${organizationId}/project/${projectId}/nexus/server/list`,
        }),
      },
      {
        name: mapping.projectProduct.value,
        type: 'string',
        label: '项目制品库',
        textField: 'neRepositoryName',
        valueField: 'repositoryId',
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[1].value),
          disabled: ({ record }) => !record.get(mapping.nexus.value),
          lookupAxiosConfig: ({ record }) => ({
            method: 'get',
            url:
              record.get(mapping.nexus.value)
              && `rdupm/v1/nexus-repositorys/choerodon/${organizationId}/project/${projectId}/repo/maven/list?configId=${record.get(
                mapping.nexus.value,
              )}`,
          }),
        },
      },
      {
        name: mapping.groupId.value,
        type: 'string',
        label: 'groupId',
        textField: 'name',
        valueField: 'value',
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[1].value),
          disabled: ({ record }) => !record.get(mapping.projectProduct.value),
          lookupAxiosConfig: ({ record }) => ({
            method: 'get',
            url:
              record.get(mapping.projectProduct.value)
              && `/rdupm/v1/nexus-repositorys/choerodon/${organizationId}/project/${projectId}/repo/maven/groupId?repositoryId=${record.get(
                mapping.projectProduct.value,
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
        name: mapping.artifactId.value,
        type: 'string',
        label: 'artifactId',
        textField: 'name',
        valueField: 'value',
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[1].value),
          disabled: ({ record }) => !record.get(mapping.groupId.value),
          lookupAxiosConfig: ({ record }) => ({
            method: 'get',
            url:
              record.get(mapping.projectProduct.value)
              && `/rdupm/v1/nexus-repositorys/choerodon/${organizationId}/project/${projectId}/repo/maven/artifactId?repositoryId=${record.get(
                mapping.projectProduct.value,
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
        name: mapping.jarVersion.value,
        type: 'string',
        label: 'jar包版本',
        textField: 'version',
        valueField: 'version',
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[1].value),
          disabled: ({ record }) => !record.get(mapping.groupId.value)
            || !record.get(mapping.artifactId.value),
          lookupAxiosConfig: ({ record }) => ({
            method: 'get',
            url:
              record.get(mapping.projectProduct.value)
            && record.get(mapping.groupId.value)
            && record.get(mapping.artifactId.value)
                && `/rdupm/v1/nexus-components/${organizationId}/project/${projectId}?page=0&size=10&repositoryId=${record.get(mapping.projectProduct.value)}&repositoryName=${(function () {
                  const repositoryId = record.get(mapping.projectProduct.value);
                  const { lookup } = record.getField(mapping.projectProduct.value);
                  return lookup.find((l) => l.repositoryId === repositoryId).neRepositoryName;
                }())}&groupId=${record.get(mapping.groupId.value)}&artifactId=${record.get(mapping.artifactId.value)}`,
          }),
        },
      },
      {
        name: mapping.workPath.value,
        type: 'string',
        label: '工作目录',
        defaultValue: '/temp',
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[1].value)
            && (record.get(mapping.deployObject.value) === mapping.deployObject.options[1].value),
        },
      },
      {
        name: 'appServiceId',
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.app` }),
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[0].value),
        },
      },
      {
        name: 'appServiceVersionId',
        type: 'string',
        textField: 'version',
        valueField: 'id',
        label: formatMessage({ id: `${intlPrefix}.app.version` }),
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[0].value),
        },
      },
      {
        name: 'environmentId',
        type: 'string',
        textField: 'name',
        valueField: 'id',
        label: formatMessage({ id: 'environment' }),
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[0].value),
        },
        options: envOptionsDs,
      },
      {
        name: 'instanceName',
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.instance.name` }),
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[0].value),
        },
        validator: checkName,
      },
      {
        name: 'valueId', type: 'string', textField: 'name', valueField: 'id', label: formatMessage({ id: `${intlPrefix}.config` }), options: valueIdOptionsDs,
      },
      { name: 'values', type: 'string' },
      { name: 'type', type: 'string', defaultValue: 'create' },
      { name: 'isNotChange', type: 'boolean', defaultValue: false },
      { name: 'appServiceSource', type: 'string', defaultValue: 'normal_service' },
    ],
    events: {
      create: handleCreate,
      update: handleUpdate,
    },
  });
});
