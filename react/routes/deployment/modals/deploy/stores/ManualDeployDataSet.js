import omit from 'lodash/omit';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import pick from 'lodash/pick';
import uuidV1 from 'uuid/v1';
import { axios } from '@choerodon/boot';
import isEmpty from 'lodash/isEmpty';
import JSONbig from 'json-bigint';
import { Base64 } from 'js-base64';
import dockerImg from '../images/docker.svg';
import jarImg from '../images/jar.svg';

const mapping = {
  deployWay: {
    value: 'deployType',
    options: [{
      value: 'env',
      label: '容器部署',
    }],
    // , {
    //   value: 'host',
    //   label: '主机部署',
    // }],
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
      img: dockerImg,
    }, {
      value: 'jar',
      label: 'jar应用',
      img: jarImg,
    }],
  },
  projectImageRepo: {
    value: 'repoId',
    textField: 'repoName',
    extraField: 'repoType',
  },
  image: {
    value: 'imageId',
    textField: 'imageName',
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
  deploySource: {
    value: 'deploySource',
    options: [{
      value: 'repository',
      label: '项目制品库',
    }, {
      value: 'market',
      label: '市场应用',
    }],
  },
};

function getRandomName(prefix = '') {
  const randomString = uuidV1();
  const realPrefix = prefix?.split('_')[1] || prefix?.split('_')[0];

  return realPrefix
    ? `${realPrefix.substring(0, 24)}-${randomString.substring(0, 5)}`
    : randomString.substring(0, 30);
}

function formatAnnotation(postData, oldAnnotation = []) {
  const annotations = {};
  forEach(oldAnnotation, ({ key, value }) => {
    if (key && value) {
      annotations[key] = value;
    }
  });
  // eslint-disable-next-line no-param-reassign
  postData.annotations = isEmpty(annotations) ? null : annotations;
}

function getRequired({ record }) {
  return record.get(mapping.deployWay.value) === (mapping.deployWay.options.length > 1 ? mapping.deployWay.options[1].value : '');
}

function getIsMarket({ record }) {
  return record.get(mapping.deploySource.value) === (mapping.deploySource.options.length > 1 ? mapping.deploySource.options[1].value : '');
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
  hasHostDeploy,
  marketAndVersionOptionsDs,
  marketServiceOptionsDs,
  hasDevops,
  random,
  appServiceSource,
}) => {
  // 如果有该参数 部署方式增加主机部署
  if (hasHostDeploy) {
    mapping.deployWay.options = [{
      value: 'env',
      label: '容器部署',
    }, {
      value: 'host',
      label: '主机部署',
    }];
  } else {
    mapping.deployWay.options = [{
      value: 'env',
      label: '容器部署',
    }];
  }
  function handleCreate({ dataSet, record }) {
    if (record.get('appServiceSource') !== 'market_service') {
      deployStore.loadAppService(projectId, record.get('appServiceSource'));
    }
  }

  function handleUpdate({
    dataSet, record, name, value,
  }) {
    const networkRecord = record.getCascadeRecords('devopsServiceReqVO')[0];
    const domainRecord = record.getCascadeRecords('devopsIngressVO')[0];
    switch (name) {
      case 'appServiceSource':
        deployStore.setAppService([]);
        value !== 'market_service' && deployStore.loadAppService(projectId, value);
        record.get('appServiceId') && record.set('appServiceId', null);
        break;
      case 'environmentId':
        record.getField('instanceName').checkValidity();
        if (record.get('appServiceSource') !== 'market_service') {
          loadValueList(record);
        }
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
          record.set('instanceName', getRandomName(value.split('**')[1]) || '');
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
      case 'marketAppAndVersion':
        record.get('marketService') && record.set('marketService', null);
        if (value && value.value) {
          marketServiceOptionsDs.setQueryParameter('marketVersionId', value.value?.id);
          marketServiceOptionsDs.query();
        }
        break;
      case 'marketService':
        if (value && !isEmpty(value.marketServiceDeployObjectVO)) {
          const {
            id: deployObjectId, devopsAppServiceCode, hzeroServiceCode,
          } = value.marketServiceDeployObjectVO;
          record.set('instanceName', getRandomName(devopsAppServiceCode || hzeroServiceCode || ''));
          record.get(mapping.deployWay.value) === mapping.deployWay.options[0].value
          && deployStore.loadMarketDeployValue(projectId, deployObjectId);
        } else {
          record.get('instanceName') && record.set('instanceName', null);
        }
        break;
      case mapping.deployWay.value:
        if (record.get(mapping.deployObject.value) !== mapping.deployObject.options[0].value) {
          loadMarketService(record, value === mapping.deployWay.options[0].value ? 'image' : 'jar');
        }
        break;
      case mapping.deployObject.value:
        loadMarketService(record, value === mapping.deployObject.options[0].value ? 'image' : 'jar');
        break;
      default:
        break;
    }
  }

  function loadMarketService(record, type) {
    marketServiceOptionsDs.setQueryParameter('type', type);
    if (record.get('marketAppAndVersion')) {
      record.get('marketService') && record.set('marketService', null);
      marketServiceOptionsDs.query();
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
        return formatMessage({ id: 'checkNameReg' });
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
      create: ({ data: [data], dataSet }) => {
        // 如果是环境部署
        if (data[mapping.deployWay.value] === mapping.deployWay.options[0].value) {
          const res = pick(data, ['values', 'devopsServiceReqVO', 'devopsIngressVO', 'environmentId', 'instanceName', 'type', 'isNotChange']);
          const isMarket = data.appServiceSource === 'market_service';
          const { marketServiceDeployObjectVO, id: marketAppServiceId } = data.marketService || {};
          const appServiceId = isMarket ? marketAppServiceId : data.appServiceId.split('**')[0];
          if (isMarket) {
            res.marketAppServiceId = marketAppServiceId;
            res.marketDeployObjectId = marketServiceDeployObjectVO
              && marketServiceDeployObjectVO.id;
          } else {
            res.appServiceId = appServiceId;
            res.appServiceVersionId = data.appServiceVersionId;
            res.valueId = data.valueId;
          }
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
            url: `/devops/v1/projects/${projectId}/app_service_instances${isMarket ? '/market/instances' : ''}`,
            method: 'post',
            data: res,
          });
        }
        // 如果是主机部署
        const res = {
          [mapping.deployWay.value]: data[mapping.deployWay.value],
          [mapping.deployObject.value]: data[mapping.deployObject.value],
        };
        res.hostConnectionVO = {
          [mapping.hostName.value]: data[mapping.hostName.value],
          [mapping.ip.value]: data[mapping.ip.value],
          [mapping.port.value]: data[mapping.port.value],
          hostSource: 'existHost',
        };
        const deploySource = data[mapping.deploySource.value];
        const deployObject = data[mapping.deployObject.value];
        res.hostId = data[mapping.hostName.value];
        res.value = Base64.encode(deployUseStore.getImageYaml);
        // 项目制品库
        if (deploySource === mapping.deploySource.options[0].value) {
          res.sourceType = 'currentProject';
          // 如果部署对象是Docker镜像
          if (deployObject === mapping.deployObject.options[0].value) {
            res.name = data[mapping.containerName.value];
            res.imageInfo = {
              [mapping.projectImageRepo.value]: data[mapping.projectImageRepo.value],
              [mapping.projectImageRepo.textField]: dataSet
                .current
                .getField(mapping.projectImageRepo.value)
                .lookup
                .find((l) => l.repoId === data[mapping.projectImageRepo.value]).repoName,
              [mapping.projectImageRepo.extraField]: dataSet
                .current
                .getField(mapping.projectImageRepo.value)
                .lookup
                .find((l) => l.repoId === data[mapping.projectImageRepo.value]).repoType,
              [mapping.image.value]: data[mapping.image.value],
              [mapping.image.textField]: dataSet
                .current
                .getField(mapping.image.value)
                .lookup
                .find((l) => l.imageId === data[mapping.image.value]).imageName,
              [mapping.imageVersion.value]: data[mapping.imageVersion.value],
              [mapping.containerName.value]: data[mapping.containerName.value],
              value: Base64.encode(deployUseStore.getImageYaml),
            };
          } else {
            //  如果部署对象是jar应用
            res.prodJarInfoVO = {
              [mapping.nexus.value]: data[mapping.nexus.value],
              [mapping.projectProduct.value]: data[mapping.projectProduct.value],
              [mapping.groupId.value]: data[mapping.groupId.value],
              [mapping.artifactId.value]: data[mapping.artifactId.value],
              [mapping.jarVersion.value]: data[mapping.jarVersion.value],
              [mapping.workPath.value]: data[mapping.workPath.value],
              value: Base64.encode(deployUseStore.getJarYaml),
            };
          }
        } else {
          // 市场应用
          const { marketServiceDeployObjectVO } = data.marketService || {};
          const deployObjectId = marketServiceDeployObjectVO && marketServiceDeployObjectVO.id;
          res.appSource = 'market';
          res.sourceType = 'market';
          res.deployObjectId = deployObjectId;
          if (deployObject === mapping.deployObject.options[0].value) {
            res.name = data[mapping.containerName.value];
            res.imageInfo = {
              deployObjectId,
              [mapping.containerName.value]: data[mapping.containerName.value],
              value: Base64.encode(deployUseStore.getImageYaml),
            };
          } else {
            res.imageInfo = {
              deployObjectId,
              [mapping.workPath.value]: data[mapping.workPath.value],
              value: Base64.encode(deployUseStore.getJarYaml),
            };
          }
        }
        return ({
          url: deployObject === mapping.deployObject.options[0].value
            ? `/devops/v1/projects/${projectId}/deploy/docker` : `/devops/v1/projects/${projectId}/deploy/host`,
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
        required: true,
        lookupAxiosConfig: () => ({
          method: 'post',
          url: `/devops/v1/projects/${projectId}/hosts/page_by_options?random=${random}`,
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
              newRes.content = newRes.content.map((i) => ({
                ...i,
                connect: i.hostStatus === 'connected',
              }));
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
        // dynamicProps: {
        //   required: getRequired,
        // },
      },
      {
        name: mapping.port.value,
        type: 'string',
        label: '端口',
        disabled: true,
        // dynamicProps: {
        //   required: getRequired,
        // },
      },
      {
        name: mapping.deployObject.value,
        type: 'string',
        label: '部署对象',
        defaultValue: mapping.deployObject.options[0].value,
        dynamicProps: {
          required: getRequired,
        },
      },
      {
        name: mapping.projectImageRepo.value,
        type: 'string',
        label: '项目镜像仓库',
        textField: 'repoName',
        valueField: 'repoId',
        dynamicProps: {
          required: ({ record }) => getRequired({ record }) && !getIsMarket({ record })
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
          required: ({ record }) => getRequired({ record }) && !getIsMarket({ record })
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
          required: ({ record }) => getRequired({ record }) && !getIsMarket({ record })
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
          required: ({ record }) => getRequired({ record })
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
          required: ({ record }) => getRequired({ record }) && !getIsMarket({ record })
            && (record.get(mapping.deployObject.value) === (mapping.deployObject.options.length > 1 ? mapping.deployObject.options[1].value : '')),
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
          required: ({ record }) => getRequired({ record }) && !getIsMarket({ record })
            && (record.get(mapping.deployObject.value) === (mapping.deployObject.options.length > 1 ? mapping.deployObject.options[1].value : '')),
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
          required: ({ record }) => getRequired({ record }) && !getIsMarket({ record })
            && (record.get(mapping.deployObject.value) === (mapping.deployObject.options.length > 1 ? mapping.deployObject.options[1].value : '')),
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
          required: ({ record }) => getRequired({ record }) && !getIsMarket({ record })
            && (record.get(mapping.deployObject.value) === (mapping.deployObject.options.length > 1 ? mapping.deployObject.options[1].value : '')),
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
          required: ({ record }) => getRequired({ record }) && !getIsMarket({ record })
            && (record.get(mapping.deployObject.value) === (mapping.deployObject.options.length > 1 ? mapping.deployObject.options[1].value : '')),
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
        defaultValue: './',
        dynamicProps: {
          required: ({ record }) => getRequired({ record })
            && (record.get(mapping.deployObject.value) === (mapping.deployObject.options.length > 1 ? mapping.deployObject.options[1].value : '')),
        },
      },
      {
        name: mapping.deploySource.value,
        type: 'string',
        label: '部署来源',
        defaultValue: 'repository',
        dynamicProps: {
          required: getRequired,
        },
      },
      {
        name: 'appServiceId',
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.app` }),
        dynamicProps: {
          required: ({ record }) => (record.get(mapping.deployWay.value)
            === mapping.deployWay.options[0].value && record.get('appServiceSource') !== 'market_service'),
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
            === mapping.deployWay.options[0].value && record.get('appServiceSource') !== 'market_service'),
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
          maxLength: ({ record }) => ((record.get(mapping.deployWay.value)
            === mapping.deployWay.options[0].value) ? 53 : null),
        },
        validator: checkName,
      },
      {
        name: 'valueId', type: 'string', textField: 'name', valueField: 'id', label: formatMessage({ id: `${intlPrefix}.config` }), options: valueIdOptionsDs,
      },
      { name: 'values', type: 'string' },
      { name: 'type', type: 'string', defaultValue: 'create' },
      { name: 'isNotChange', type: 'boolean', defaultValue: false },
      {
        name: 'appServiceSource',
        type: 'string',
        defaultValue: appServiceSource || (hasDevops ? 'normal_service' : 'share_service'),
      },
      {
        name: 'marketAppAndVersion',
        label: formatMessage({ id: `${intlPrefix}.appAndVersion` }),
        type: 'object',
        dynamicProps: {
          required: ({ record }) => ((record.get(mapping.deployWay.value)
            === mapping.deployWay.options[0].value && record.get('appServiceSource') === 'market_service'))
          || (getRequired({ record }) && getIsMarket({ record })),
        },
        ignore: 'always',
      },
      {
        name: 'marketService',
        type: 'object',
        label: formatMessage({ id: `${intlPrefix}.marketServiceAndVersion` }),
        textField: 'marketServiceName',
        valueField: 'id',
        dynamicProps: {
          required: ({ record }) => ((record.get(mapping.deployWay.value)
            === mapping.deployWay.options[0].value && record.get('appServiceSource') === 'market_service'))
          || (getRequired({ record }) && getIsMarket({ record })),
        },
        options: marketServiceOptionsDs,
      },
    ],
    events: {
      create: handleCreate,
      update: handleUpdate,
    },
  });
});
