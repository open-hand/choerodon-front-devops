/* eslint-disable */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Form,
  Select,
  TextField,
  SelectBox,
  Tooltip,
  Button,
  Modal,
  TextArea,
  NumberField,
} from 'choerodon-ui/pro';
import { NewTips } from '@choerodon/components';
import { Icon, Spin } from 'choerodon-ui';
import { axios, Choerodon } from '@choerodon/master';
import { Base64 } from 'js-base64';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { observer } from 'mobx-react-lite';
import JSONbig from 'json-bigint';
import { get, isNil, isEmpty } from 'lodash';
import DeployConfig from '@/components/deploy-config-form';
import StatusDot from '@/components/status-dot';
import {
  handleSetSubmitDataByDeployGroupConfig,
  handleSetSubmitDataByContainerConfig,
} from '@/routes/app-center-pro/components/OpenAppCreateModal';
import { initValueIdDataSet } from './stores/addCDTaskDataSet';
import { deployConfigDataSet, appNameChartDataSet } from './stores/deployChartDataSet';
import DeployChart from './components/deploy-chart';
import DeployGroup from './components/deploy-group';
import addCDTaskDataSetMap, {
  typeData,
  fieldMap,
  deployWayData,
  relativeObjData,
} from './stores/addCDTaskDataSetMap';
import { mapping } from './stores/deployChartDataSet';
import { useAddCDTaskStore } from './stores';
import YamlEditor from '@/components/yamlEditor';
import Tips from '@/components/new-tips';
import './index.less';
import { mapping as deployChartMapping } from './stores/deployChartDataSet';
import { mapping as deployGroupMapping, appNameDataSet } from './stores/deployGroupDataSet';
import { productTypeData } from './stores/addCDTaskDataSetMap';
import OperationYaml from '@/routes/app-center-pro/components/OpenAppCreateModal/components/operation-yaml';
import { valueCheckValidate } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config/content';
import {BUILD_DOCKER, BUILD_MAVEN_PUBLISH, BUILD_UPLOADJAR, MAVEN_BUILD} from "@/routes/app-pipeline/CONSTANTS";
// import { queryConfigCodeOptions } from '@/components/configuration-center/ConfigurationTab';

let currentSize = 10;

const originBranchs = [
  {
    value: 'master',
    name: 'master',
  },
  {
    value: 'feature',
    name: 'feature',
  },
  {
    value: 'bugfix',
    name: 'bugfix',
  },
  {
    value: 'hotfix',
    name: 'hotfix',
  },
  {
    value: 'release',
    name: 'release',
  },
  {
    value: 'tag',
    name: 'tag',
  },
];

const { Option } = Select;

export default observer(() => {
  const {
    ADDCDTaskDataSet,
    appServiceId,
    appServiceName,
    AppState,
    AppState: {
      currentMenuType: { projectId },
    },
    modal,
    ADDCDTaskUseStore,
    handleOk,
    taskType,
    jobDetail,
    stageData: pipelineStageMainSource,
    stageIndex: columnIndex,
    jobIndex: witchColumnJobIndex,
    index: taskIndex,
    DeployChartDataSet,
    DeployGroupDataSet,
    trueAppServiceId,
    HostJarDataSet,
    // configurationCenterDataSet,
    // configCompareOptsDS,
    // deployConfigUpDateDataSet,
    HotJarOptionsDataSet,
  } = useAddCDTaskStore();

  const deployGroupcRef = useRef();

  const [oldValue, setOldValue] = useState('');
  const [deployWay, setDeployWay] = useState('');
//   const [isQueryDeployConfig, setIsQueryDeployConfig] = useState(true);
  const [deployGroupDetail, setDeployGroupDetail] = useState(undefined);
  const [branchsList, setBranchsList] = useState([]);
  const [valueIdValues, setValueIdValues] = useState('');
  const [customValues, setCustomValues] = useState(
    '# 自定义ssh指令\n# 比如部署镜像\n# 需要包括部署镜像指令以及二次触发部署的停用删除逻辑\ndocker stop mynginx & docker rm mynginx & docker run --name mynginx -d nginx:latest',
  );
  const [imageDeployValues, setImageDeployValues] = useState(
    '# docker run指令\n# 不可删除${containerName}和${imageName}占位符\n# 不可删除 -d: 后台运行容器\n# 其余参数可参考可根据需要添加\ndocker run --name=${containerName} -d ${imageName}',
  );
  const [jarValues, setJarValues] = useState(
    '# java -jar指令\n' +
      '# 不可删除${jar}\n' +
      '# java -jar 后台运行参数会自动添加 不需要在重复添加\n' +
      '# 其余参数可参考可根据需要添加\n' +
      'java -jar ${jar}\n' +
      "# 相关文件存放目录：jar包下载目录为$HOME/choerodon/实例id/temp-jar/, 日志存放目录为$HOME/choerodon/实例id/temp-jar/',\n",
  );
  // + '# 默认工作目录，当前工作目录(./)，jar包下载存放目录为：./temp-jar/xxx.jar 日志存放目录为：./temp-log/xxx.log\n'
  // + '# 填写工作目录，jar包下载存放目录为：工作目录/temp-jar/xxx.jar 日志存放目录为：工作目录/temp-jar/xxx.log\n'
  // + '# 请确保用户有该目录操作权限');
  const [testStatus, setTestStatus] = useState('');
  const [accountKeyValue, setAccountKeyValue] = useState('');
  const [relatedJobOpts, setRelatedJobOpts] = useState([]);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [pipelineCallbackAddress, setPipelineCallbackAddress] = useState(undefined);
  const [preJobList, setPreJobList] = useState([]);
  //   const [configDataSet, setConfigDataSet] = useState(configurationCenterDataSet);

  //   useEffect(() => {
  //     setDeployWay(ADDCDTaskDataSet.current.get(fieldMap.deployWay.name));
  //     if (deployWay === 'update' && isQueryDeployConfig) {
  //       handleInitDeployConfig(HostJarDataSet.current?.get('appName'));
  //     } else {
  //       deployConfigUpDateDataSet.removeAll();
  //     }
  //   }, [ADDCDTaskDataSet.current, deployWay, HostJarDataSet.current, HotJarOptionsDataSet.current]);

  //   const handleInitDeployConfig = (value) => {
  //     const id = HotJarOptionsDataSet.find((i) => i.get('name') === value)?.get('instanceId');
  //     if (!isNil(id)) {
  //       getDetailData(id);
  //     }
  //   };

  //   const getDetailData = async (id) => {
  //     configurationCenterDataSet.setQueryParameter('value', id);
  //     configurationCenterDataSet.setQueryParameter('key', 'instance_id');
  //     await configurationCenterDataSet.query();
  //     setIsQueryDeployConfig(false);
  //     deployConfigUpDateDataSet.removeAll();
  //     configurationCenterDataSet.toData().forEach((item) => {
  //       deployConfigUpDateDataSet.create({ ...item });
  //     });
  //     queryConfigCodeOptions(configCompareOptsDS, deployConfigUpDateDataSet);
  //     setConfigDataSet(deployConfigUpDateDataSet);
  //   };

  useEffect(() => {
    ADDCDTaskUseStore.setValueIdRandom(Math.random());
    axios.get(`/iam/choerodon/v1/projects/${projectId}/check_admin_permission`).then((res) => {
      setIsProjectOwner(res);
    });
    axios.get('/devops/v1/cd_pipeline/external_approval_task/callback_url').then((res) => {
      setPipelineCallbackAddress(res);
    });
    ADDCDTaskDataSet.current.set('type', taskType);
    const newData = {
      type: taskType,
      glyyfw: appServiceName,
      triggerType: 'refs',
      deployType: 'create',
      authType: 'accountPassword',
      hostDeployType: 'jar',
      deploySource: 'pipelineDeploy',
      [addCDTaskDataSetMap.hostSource]: addCDTaskDataSetMap.alreadyhost,
      workingPath: './',
      name: ADDCDTaskDataSet.current.get('name') || undefined,
      [addCDTaskDataSetMap.alarm]: false,
      [addCDTaskDataSetMap.whetherBlock]: true,
      [fieldMap.deployWay.name]: deployWayData[0].value,
      [fieldMap.productType.name]: productTypeData[0].value,
      [addCDTaskDataSetMap.triggersTasks.name]: addCDTaskDataSetMap.triggersTasks.values[0],
      [fieldMap.preCommand.name]: fieldMap.preCommand.defaultValue,
      [fieldMap.runCommand.name]: fieldMap.runCommand.defaultValue,
      [fieldMap.postCommand.name]: fieldMap.postCommand.defaultValue,
      [fieldMap.killCommand.name]: fieldMap.killCommand.defaultValue,
      [fieldMap.dockerCommand.name]: fieldMap.dockerCommand.defaultValue,
      [fieldMap.healthProb.name]: fieldMap.healthProb.defaultValue,
      [fieldMap.relativeObj.name]: fieldMap.relativeObj.defaultValue,
      [fieldMap.dockerCompose.name]: fieldMap.dockerCompose.defaultValue,
      [fieldMap.dockerComposeRunCommand.name]: fieldMap.dockerComposeRunCommand.defaultValue,
    };
    if (taskType === 'cdHost' && relatedJobOpts && relatedJobOpts.length === 1) {
      newData.pipelineTask = relatedJobOpts[0].name;
    }
    ADDCDTaskDataSet.loadData([newData]);
    getRelativeBaseOnCondition();
  }, []);

  const getRelativeBaseOnCondition = () => {
    const filterColumns = pipelineStageMainSource.slice(0, columnIndex);
    let itemPreJobLists = [];
    filterColumns.forEach((item, itemIndex) => {
      if (itemIndex + 1 <= columnIndex) {
        itemPreJobLists = [...itemPreJobLists, ...item?.jobList || []];
      } else {
        item?.jobList?.forEach((jobItem, jobItemIndex) => {
          if (jobItemIndex + 1 <= witchColumnJobIndex) {
            itemPreJobLists.push(jobItem);
          }
        });
      }
    });
    setPreJobList(itemPreJobLists);
  };

  useEffect(() => {
    const value = ADDCDTaskDataSet.current.get(fieldMap.deployWay.name);
    ADDCDTaskDataSet.getField(addCDTaskDataSetMap.host).set(
      'disabled',
      value === deployWayData[1].value && ADDCDTaskDataSet.current.get('type') === 'cdHost',
    );
  }, [ADDCDTaskDataSet.current.get(fieldMap.deployWay.name)]);

  useEffect(() => {
    const currentHostDeployType = ADDCDTaskDataSet?.current?.get('hostDeployType');
    const tempArr =
      pipelineStageMainSource &&
      pipelineStageMainSource.length > 0 &&
      pipelineStageMainSource.map((item) => item?.jobList?.slice()).filter(i => i) || [];
    const jobArr = tempArr && tempArr.length > 0 ? [].concat.apply(...tempArr) : [];
    let filterArr;
    const alreadyPipelineTaskValue = ADDCDTaskDataSet?.current?.get('pipelineTask');
    if (jobArr && currentHostDeployType && currentHostDeployType === 'image') {
      filterArr = jobArr.filter((x) => x?.devopsCiStepVOList?.some(i => i?.type === BUILD_DOCKER) && x.type === MAVEN_BUILD);
    } else if (currentHostDeployType === 'jar') {
      filterArr = jobArr.filter(
        (x) =>
          (x?.devopsCiStepVOList?.some(i => [BUILD_MAVEN_PUBLISH, BUILD_UPLOADJAR].includes(i?.type)) &&
          x.type === MAVEN_BUILD
      ));
    } else if (['docker', 'docker_compose'].includes(currentHostDeployType)) {
      filterArr = jobArr.filter(
        (x) =>
          (x?.devopsCiStepVOList?.some(i => [BUILD_DOCKER].includes(i?.type)) &&
            x.type === MAVEN_BUILD
          ));
    }
    if (filterArr && filterArr.length === 1) {
      if (typeof filterArr[0] === 'object' && !alreadyPipelineTaskValue) {
        ADDCDTaskDataSet.current.set('pipelineTask', filterArr[0].name);
      }
    }
    if (filterArr && filterArr.length > 0) {
      setRelatedJobOpts(filterArr);
    } else {
      setRelatedJobOpts([]);
    }
  }, [ADDCDTaskDataSet?.current?.get('hostDeployType')]);

  useEffect(() => {
    const value = ADDCDTaskDataSet.current.get('envId');
    DeployGroupDataSet.getField(deployGroupMapping().appName.name).set('disabled', !value);
    DeployGroupDataSet.getField(deployGroupMapping().appCode.name).set('disabled', !value);
    DeployChartDataSet.getField(deployChartMapping().appName.name).set('disabled', !value);
    DeployChartDataSet.getField(deployChartMapping().appCode.name).set('disabled', !value);
  }, [ADDCDTaskDataSet.current.get('envId')]);

  useEffect(() => {
    const alreadyPipelineTaskValue = ADDCDTaskDataSet?.current?.get('pipelineTask');
    if (relatedJobOpts && relatedJobOpts.length === 1 && !alreadyPipelineTaskValue) {
      ADDCDTaskDataSet.current.set('pipelineTask', relatedJobOpts[0].name);
    } else if (!alreadyPipelineTaskValue) {
      ADDCDTaskDataSet.current.init('pipelineTask');
    }
  }, [relatedJobOpts, ADDCDTaskDataSet?.current?.get('hostDeployType')]);

  /**
   * 这里是如果有关联构建任务 则默认选中该关联任务的匹配类型和触发分支
   * 并且将匹配类型禁用 然后设置触发分支可选项只能为该关联任务的触发分支
   */
  useEffect(() => {
    const pipelineTask = ADDCDTaskDataSet?.current?.get('pipelineTask');
    const hostDeployType = ADDCDTaskDataSet?.current?.get('hostDeployType');
    const deploySource = ADDCDTaskDataSet?.current?.get('deploySource');
    const type = ADDCDTaskDataSet?.current?.get('type');
    // 如果是主机部署并且部署模式是镜像部署或者jar包部署并且部署来源是流水线制品
    if (
      type === 'cdHost' &&
      ['image', 'jar'].includes(hostDeployType) &&
      deploySource === 'pipelineDeploy' &&
      pipelineTask &&
      relatedJobOpts &&
      relatedJobOpts.length > 0
    ) {
      const flag = relatedJobOpts.find((i) => i.name === pipelineTask);
      if (flag) {
        const { triggerType, triggerValue } = flag;
        ADDCDTaskDataSet.current.set('triggerType', triggerType);
        ADDCDTaskDataSet.getField('triggerType').set('disabled', true);
        ADDCDTaskDataSet.current.set('triggerValue', triggerValue?.split(','));
        if (triggerValue) {
          setBranchsList(
              triggerValue?.split(',').map((i) => ({
                value: i,
                name: i,
              })),
          );
        }
      }
    } else {
      ADDCDTaskDataSet.getField('triggerType').set('disabled', false);
      setBranchsList(originBranchs);
      // ADDCDTaskDataSet.getField('triggerValue').set('disabled', false);
    }
  }, [
    ADDCDTaskDataSet?.current?.get('pipelineTask'),
    ADDCDTaskDataSet?.current?.get('type'),
    ADDCDTaskDataSet?.current?.get('hostDeployType'),
    ADDCDTaskDataSet?.current?.get('deploySource'),
  ]);

  function getMetadata(ds, deployChartData, extraData) {
    ds[fieldMap.preCommand.name] = Base64.encode(ds[fieldMap.preCommand.name]);
    ds[fieldMap.runCommand.name] = Base64.encode(ds[fieldMap.runCommand.name]);
    ds[fieldMap.postCommand.name] = Base64.encode(ds[fieldMap.postCommand.name]);
    ds[fieldMap.killCommand.name] = Base64.encode(ds[fieldMap.killCommand.name]);
    ds[fieldMap.dockerCommand.name] = Base64.encode(ds[fieldMap.dockerCommand.name]);
    ds[fieldMap.healthProb.name] = Base64.encode(ds[fieldMap.healthProb.name]);
    if (ds.type === 'cdDeploy') {
      ds.value = Base64.encode(valueIdValues);
      // 如果部署模式是新建 则删掉多余的实例id
      if (ds.deployType && ds.deployType === 'create') {
        delete ds.instanceId;
      } else {
        // 如果是替换 则除了传id 还需要传对应的name
        const instanceName = ADDCDTaskUseStore.getInstanceList?.find((i) => i.id === ds.instanceId)
          ?.code;
        ds.instanceName = instanceName;
      }
    }
    if (ds.type === addCDTaskDataSetMap.apiTest) {
      ds.apiTestTaskName = ADDCDTaskUseStore?.getApiTestArray?.find(
        (i) => i.id == ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.apiTestMission),
      )?.name;
      ds[fieldMap.relativeObj.name] = ADDCDTaskDataSet.current.get(
        fieldMap.relativeObj.name);
      ds[fieldMap.kits.name] = ADDCDTaskDataSet.current.get(
        fieldMap.kits.name);
      ds[addCDTaskDataSetMap.relativeMission] = ADDCDTaskDataSet.current.get(
        addCDTaskDataSetMap.relativeMission,
      );
      ds.warningSettingVO = {
        [addCDTaskDataSetMap.whetherBlock]: ds[addCDTaskDataSetMap.whetherBlock],
        [addCDTaskDataSetMap.alarm]: ds[addCDTaskDataSetMap.alarm],
        [addCDTaskDataSetMap.threshold]: ds[addCDTaskDataSetMap.threshold],
        [addCDTaskDataSetMap.notifyObject]: ds[addCDTaskDataSetMap.notifyObject],
      };
      if (ds[addCDTaskDataSetMap.notifyWay]) {
        ds[addCDTaskDataSetMap.notifyWay].split(',').forEach((item) => {
          ds.warningSettingVO[item] = true;
        });
      }
    }
    if (ds.type === 'cdHost') {
      ds.hostConnectionVO = {
        [addCDTaskDataSetMap.hostSource]: ds[addCDTaskDataSetMap.hostSource],
        [addCDTaskDataSetMap.host]: ds[addCDTaskDataSetMap.host],
        hostIp: ds.hostIp,
        hostPort: ds.hostPort,
        authType: ds.authType,
        username: ds.username,
        password:
          ds.authType === 'accountPassword'
            ? ds.password
            : accountKeyValue && Base64.encode(accountKeyValue),
      };
      const currentObj = {
        deploySource: ds.deploySource,
      };
      if (ds.hostDeployType === 'customize') {
        ds.customize = {
          values: Base64.encode(customValues),
        };
      } else if (ds.hostDeployType === 'image') {
        if (ds.deploySource === 'matchDeploy') {
          const repo = ADDCDTaskUseStore.getRepoList?.find(
            (i) => String(i.repoId) === String(ds.repoId),
          );
          const img = ADDCDTaskUseStore.getImageList?.find(
            (i) => String(i.imageId) === String(ds.imageId),
          );
          ds.imageDeploy = {
            ...currentObj,
            repoId: ds.repoId,
            repoName: repo?.repoName,
            repoType: repo?.repoType,
            imageId: ds.imageId,
            imageName: img?.imageName,
            matchType: ds.matchType,
            matchContent: ds.matchContent,
            containerName: ds.containerName,
            value: Base64.encode(imageDeployValues),
          };
        } else if (ds.deploySource === 'pipelineDeploy') {
          ds.imageDeploy = {
            ...currentObj,
            pipelineTask: ds.pipelineTask,
            containerName: ds.containerName,
            value: Base64.encode(imageDeployValues),
          };
        }
      } else if (ds.hostDeployType === 'jar') {
        if (ds.deploySource === 'matchDeploy') {
          ds.jarDeploy = {
            ...currentObj,
            serverName: ds.serverName,
            repositoryId: ds.repositoryId,
            groupId: ds.groupId,
            artifactId: ds.artifactId,
            versionRegular: ds.versionRegular,
            value: Base64.encode(jarValues),
          };
        } else if (ds.deploySource === 'pipelineDeploy') {
          ds.jarDeploy = {
            ...currentObj,
            pipelineTask: ds.pipelineTask,
            // value: Base64.encode(jarValues),
          };
          // ds[fieldMap.preCommand.name] = Base64.encode(ds[fieldMap.preCommand.name]);
          // ds[fieldMap.runCommand.name] = Base64.encode(ds[fieldMap.runCommand.name]);
          // ds[fieldMap.postCommand.name] = Base64.encode(ds[fieldMap.postCommand.name]);
        }
        ds.jarDeploy.name = ds.appInstanceName;
        ds.jarDeploy.workingPath = ds.workingPath;
      } else if (ds.hostDeployType === productTypeData[1].value) {
        ds.imageDeploy = {
          ...currentObj,
          containerName: ds.containerName,
          pipelineTask: ds.pipelineTask,
        }
      } else if (ds.hostDeployType === productTypeData[2].value) {
        // ds[fieldMap.preCommand.name] = Base64.encode(ds[fieldMap.preCommand.name]);
        // ds[fieldMap.runCommand.name] = Base64.encode(ds[fieldMap.runCommand.name]);
        // ds[fieldMap.postCommand.name] = Base64.encode(ds[fieldMap.postCommand.name]);
      } else if (ds.hostDeployType === 'docker_compose') {
        ds.runCommand = Base64.encode(ds.dockerComposeRunCommand);
        ds.imageJobName = ds.pipelineTask;
        delete ds.dockerCommand;
        delete ds.dockerComposeRunCommand;
        delete ds.healthProb;
        delete ds.killCommand;
        delete ds.postCommand;
        delete ds.preCommand;
        delete ds.value;
      }
    }
    if (ds.type === typeData[0].value) {
      ds.skipCheckPermission = !ds.checkEnvPermissionFlag;
      ds.deployObjectType = ds.type;
      ds = {
        ...deployChartData,
        ...ds,
        valueId: deployChartData.valueId || ds.valueId,
        appId: deployChartData?.appId,
        appName: deployChartData.appName,
        appCode: deployChartData.appCode,
      };
      delete ds.value;
    }
    if (['cdHost', typeData[1].value].includes(ds.type)) {
      ds = {
        ...ds,
        ...extraData,
        [fieldMap.deployWay.name]: ds[fieldMap.deployWay.name],
      };
    }
    ds.appServiceId = appServiceId;
    return JSON.stringify(ds).replace(/"/g, "'");
  }

  // TODO: 流水线CD -校验
  const handleAdd = async () => {
    let deployChartData;
    const result = await ADDCDTaskDataSet.current.validate(true);
    // const configResult = await deployConfigUpDateDataSet.validate();
    // const configData = deployConfigUpDateDataSet.map((o) => {
    //   return {
    //     configId: configCompareOptsDS.find((i) => i.get('versionName') === o.get('versionName'))?.get('configId'),
    //     mountPath: o.get('mountPath'),
    //     configGroup: o.get('configGroup'),
    //     configCode: o.get('configCode'),
    //   };
    // });
    if (
      result
      //  && configResult
    ) {
      let submitData = {};
      const ds = JSON.parse(JSON.stringify(ADDCDTaskDataSet.toData()[0]));
      if (ds.type === 'cdHost') {
        const hostjarValidate = await HostJarDataSet.current.validate(true);
        const flag = valueCheckValidate(
          ADDCDTaskDataSet.current.get(fieldMap.preCommand.name),
          ADDCDTaskDataSet.current.get(fieldMap.runCommand.name),
          ADDCDTaskDataSet.current.get(fieldMap.postCommand.name),
        );
        if (flag && hostjarValidate) {
          submitData = HostJarDataSet.current.toData();
          //   submitData.configSettingVOS = configData;
        } else {
          return false;
        }
      }
      if (ds.type === typeData[0].value) {
        const chartDeployValidate = await DeployChartDataSet.current.validate(true);
        if (chartDeployValidate) {
          // let appId = {
          //   appId: undefined,
          // };
          if (ADDCDTaskDataSet.current.get(fieldMap.deployWay.name) === deployWayData[1].value) {
            // const options = DeployChartDataSet.current.getField(deployChartMapping().appName.name)
            //   .options;
            // const item = options.records.find(
            //   (item) =>
            //     item.get('name') ===
            //     DeployChartDataSet.current.get(deployChartMapping().appName.name),
            // );
            // appId = {
            //   appId: item.get('id'),
            // };
          }
          deployChartData = {
            ...DeployChartDataSet.current.toData(),
            // ...appId,
          };
        } else {
          return false;
        }
      }
      if (ds.type === typeData[1].value) {
        const data = await deployGroupcRef.current.handleOk();
        if (!data) {
          return false;
        } else {
          submitData = {
            ...submitData,
            ...DeployGroupDataSet.current.toData(),
          };
          const returnData = handleSetSubmitDataByDeployGroupConfig({
            appConfigData: data.appConfig,
            submitData,
          });
          if (ADDCDTaskDataSet?.current?.get('deployType') === 'update') {
            returnData.appId = appNameDataSet?.toData().find(i => i?.code === returnData?.appCode)?.id;
          }
          const result = handleSetSubmitDataByContainerConfig({
            resourceConfigData: data.containerConfig,
            submitData: returnData,
          });
          // let appId;
          // if (ADDCDTaskDataSet.current.get(fieldMap.deployWay.name) === deployWayData[1].value) {
          //   const options = DeployGroupDataSet.current.getField(deployGroupMapping().appName.name)
          //     .options;
          //   const item = options.records.find(
          //     (item) =>
          //       item.get('name') ===
          //       DeployGroupDataSet.current.get(deployGroupMapping().appName.name),
          //   );
          //   appId = item.get('id');
          // }
          submitData = {
            ...result,
            // appId,
          };
        }
      }
      // if (ds.type === 'cdHost') {
      //   if (!(await handleTestConnect())) {
      //     return false;
      //   }
      // }
      const cdAuditUserIds = ds.cdAuditUserIds.map((x) => (typeof x === 'object' ? x.id : x));
      const data = {
        ...ds,
        cdAuditUserIds,
        triggerValue:
          typeof ds.triggerValue === 'object' ? ds.triggerValue?.join(',') : ds.triggerValue,
        // configSettingVOS: configData,
        completed: true,
      };
      if (ds.type !== 'cdAudit') {
        data.metadata = getMetadata(ds, deployChartData, {
          ...submitData,
          envId: data.envId,
        });
      }
      handleOk(data);
      return true;
    }
    return false;
  };

  modal.handleOk(handleAdd);

  useEffect(() => {
    if (jobDetail) {
      let newCdAuditUserIds = jobDetail?.cdAuditUserIds;
      let preCommand;
      let runCommand;
      let postCommand;
      let killCommand;
      let dockerCommand;
      let healthProb;
      let extra = {};
      // if (jobDetail.type === "cdDeploy") {
      //   const { value } = JSONbig.parse(jobDetail.metadata.replace(/'/g, '"'));
      //   value && setValueIdValues(Base64.decode(value));
      // } else
      if (jobDetail.type === addCDTaskDataSetMap.apiTest) {
        if (jobDetail.metadata) {
          const metadata = JSONbig.parse(jobDetail.metadata.replace(/'/g, '"'));
          extra[addCDTaskDataSetMap.relativeMission] =
            metadata[addCDTaskDataSetMap.relativeMission];
          if (metadata.warningSettingVO) {
            Object.keys(metadata.warningSettingVO).forEach((item) => {
              extra[item] = metadata.warningSettingVO[item];
            });
            extra[addCDTaskDataSetMap.notifyWay] = [];
            if (metadata.warningSettingVO.sendEmail) {
              extra[addCDTaskDataSetMap.notifyWay].push('sendEmail');
            }
            if (metadata.warningSettingVO.sendSiteMessage) {
              extra[addCDTaskDataSetMap.notifyWay].push('sendSiteMessage');
            }
            extra[addCDTaskDataSetMap.notifyWay] = extra[addCDTaskDataSetMap.notifyWay].join(',');
          }
          extra.apiTestConfigId = metadata.apiTestConfigId;
          ADDCDTaskDataSet.getField(addCDTaskDataSetMap.apiTestMission).options.setQueryParameter('id', metadata.apiTestTaskId);
          ADDCDTaskDataSet.getField(addCDTaskDataSetMap.apiTestMission).options.query();
        }
      } else if (jobDetail.type === 'cdHost') {
        const metadata = JSONbig.parse(jobDetail.metadata.replace(/'/g, '"'));
        preCommand = Base64.decode(metadata[fieldMap.preCommand.name]);
        runCommand = Base64.decode(metadata[fieldMap.runCommand.name]);
        postCommand = Base64.decode(metadata[fieldMap.postCommand.name]);
        killCommand = metadata?.[fieldMap.killCommand.name] ? Base64.decode(metadata[fieldMap.killCommand.name]) : '';
        healthProb = metadata?.[fieldMap.healthProb.name] ? Base64.decode(metadata[fieldMap.healthProb.name]) : '';
        dockerCommand = metadata?.[fieldMap.dockerCommand.name] ? Base64.decode(metadata[fieldMap.dockerCommand.name]) : '';
        HostJarDataSet.loadData([
          {
            appName: metadata.appName,
            appCode: metadata.appCode,
            appId: metadata.appId,
          },
        ]);
        extra = {
          ...metadata?.hostConnectionVO,
          ...metadata?.jarDeploy,
          ...metadata?.imageDeploy,
        };
        // 如果初始值没有主机来源值 说明是老数据 前端默认将主机来源设置成自定义
        if (!extra[addCDTaskDataSetMap.hostSource]) {
          extra[addCDTaskDataSetMap.hostSource] = addCDTaskDataSetMap.customhost;
        }
        if (extra?.authType === 'accountKey') {
          setAccountKeyValue(Base64.decode(extra.password));
        }
        const { hostDeployType } = metadata;
        if (hostDeployType === 'customize') {
          setCustomValues(Base64.decode(metadata.customize?.values));
        } else if (hostDeployType === 'image') {
          setImageDeployValues(Base64.decode(metadata.imageDeploy.value));
        } else if (hostDeployType === 'docker_compose') {
          extra[fieldMap.dockerComposeRunCommand.name] = runCommand;
        }

        if (metadata?.deployType === deployWayData[1].value) {
          HostJarDataSet?.current?.getField('appCode').set('disabled', true);
        }
        //  else if (hostDeployType === "jar") {
        //   extra.appInstanceName = metadata.jarDeploy.name;
        //   setJarValues(Base64.decode(metadata.jarDeploy.value));
        // }
      } else if (jobDetail.type === 'cdAudit') {
        if (jobDetail.metadata) {
          const { cdAuditUserIds } = JSON.parse(jobDetail.metadata.replace(/'/g, '"'));
          newCdAuditUserIds = cdAuditUserIds && [...cdAuditUserIds];
        }
      } else if (jobDetail.type === typeData[0].value) {
        const metadata = JSONbig.parse(jobDetail.metadata.replace(/'/g, '"'));
        DeployChartDataSet.loadData([metadata]);
        function afterQuery(res) {
          const id = String(metadata.valueId);
          const config = res.find((item) => item.id === id);
          DeployChartDataSet.current.set(deployChartMapping().value.name, config.value);
        }
        initValueIdDataSet(
          deployConfigDataSet,
          appServiceId,
          metadata.envId,
          ADDCDTaskUseStore.getValueIdRandom,
          afterQuery,
        );
        initValueIdDataSet(appNameChartDataSet, appServiceId, metadata.envId);
      } else if (jobDetail.type === typeData[1].value) {
        const metadata = JSON.parse(jobDetail.metadata.replace(/'/g, '"'));
        setDeployGroupDetail(metadata);
      }
      const newJobDetail = {
        ...jobDetail,
        ...extra,
        ...(jobDetail.metadata
          ? {
              ...JSONbig.parse(jobDetail.metadata.replace(/'/g, '"')),
              checkEnvPermissionFlag: !JSONbig.parse(jobDetail.metadata.replace(/'/g, '"'))
                ?.skipCheckPermission,
            }
          : {}),
        cdAuditUserIds: newCdAuditUserIds && [...newCdAuditUserIds],
        triggerValue:
          jobDetail.triggerType === 'regex'
            ? (jobDetail?.triggerValue ? jobDetail?.triggerValue : undefined)
            : (jobDetail?.triggerValue ? jobDetail?.triggerValue?.split(',') : undefined),
        preCommand,
        runCommand,
        postCommand,
        killCommand,
        healthProb,
        dockerCommand,
        deploySource: extra?.deploySource || 'pipelineDeploy',
      };
      delete newJobDetail.metadata;
      if (newJobDetail.envId) {
        newJobDetail.envId = String(newJobDetail.envId);
      }
      if (newJobDetail.valueId) {
        newJobDetail.valueId = String(newJobDetail.valueId);
      }
      ADDCDTaskDataSet.loadData([newJobDetail]);
    }
    ADDCDTaskDataSet.current.set(
      'glyyfw',
        appServiceName,
    );
  }, [ADDCDTaskDataSet,appServiceId, jobDetail]);

  useEffect(() => {
    async function initBranchs() {
      const value = ADDCDTaskDataSet.current.get('triggerType');
      if (value && !value.includes('exact')) {
        setBranchsList(originBranchs);
      } else {
        getBranchsList();
      }
    }
    initBranchs();
  }, [currentSize, ADDCDTaskDataSet.current.get('triggerType')]);

  const getTestDom = () => {
    const res = {
      loading: (
        <div className="testConnectCD">
          正在进行连接测试
          <Spin />
        </div>
      ),
      success: (
        <div
          style={{
            background: 'rgba(0,191,165,0.04)',
            borderColor: 'rgba(0,191,165,1)',
          }}
          className="testConnectCD"
        >
          <span style={{ color: '#3A345F' }}>测试连接：</span>
          <span style={{ color: '#00BFA5' }}>
            <Icon
              style={{
                border: '1px solid rgb(0, 191, 165)',
                borderRadius: '50%',
                marginRight: 2,
                fontSize: '9px',
              }}
              type="done"
            />
            成功
          </span>
        </div>
      ),
      error: (
        <div
          style={{
            background: 'rgba(247,122,112,0.04)',
            borderColor: 'rgba(247,122,112,1)',
          }}
          className="testConnectCD"
        >
          <span style={{ color: '#3A345F' }}>测试连接：</span>
          <span style={{ color: '#F77A70' }}>
            <Icon
              style={{
                border: '1px solid #F77A70',
                borderRadius: '50%',
                marginRight: 2,
                fontSize: '9px',
              }}
              type="close"
            />
            失败
          </span>
        </div>
      ),
    };
    return res[testStatus];
  };

  const handleTestConnect = async () =>
    new Promise((resolve) => {
      const {
        hostIp,
        hostPort,
        username,
        password,
        authType,
        [addCDTaskDataSetMap.host]: host,
      } = ADDCDTaskDataSet.toData()[0];
      axios
        .post(
          ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.hostSource) ===
            addCDTaskDataSetMap.alreadyhost
            ? `/devops/v1/projects/${projectId}/hosts/connection_test_by_id?host_id=${host}`
            : `/devops/v1/projects/${projectId}/cicd_pipelines/test_connection`,
          {
            hostIp,
            hostPort,
            username,
            password:
              authType === 'accountPassword'
                ? password
                : accountKeyValue && Base64.encode(accountKeyValue),
            authType,
          },
        )
        .then((res) => {
          setTestStatus(res ? 'success' : 'error');
          resolve(res);
        })
        .catch(() => {
          setTestStatus('error');
          resolve(false);
        });
    });

  const renderRelatedJobOpts = () => {
    const currentHostDeployType = ADDCDTaskDataSet?.current?.get(
      'hostDeployType'
    );
    const tempArr = pipelineStageMainSource
      && pipelineStageMainSource.length > 0
      && pipelineStageMainSource.map((item) => item?.jobList?.slice());
    const jobArr = tempArr
      ? tempArr.length > 0 && [].concat.apply(...tempArr)
      : [];
    let filterArr;
    if (jobArr && currentHostDeployType && currentHostDeployType === 'image') {
      filterArr = jobArr.filter(
        (x) => x.configJobTypes?.includes('docker') && x.type === 'build',
      );
    } else if (currentHostDeployType === 'jar') {
      filterArr = jobArr.filter(
        (x) => (x.configJobTypes?.includes('maven_deploy')
            || x.configJobTypes?.includes('upload_jar'))
          && x.type === 'build',
      );
    }
    if (filterArr && filterArr.length > 0) {
      if (typeof filterArr[0] === 'object') {
        ADDCDTaskDataSet.current.set('pipelineTask', filterArr[0].name);
      }
    }
    return (
      filterArr
      && filterArr.length > 0
      && filterArr.map((item) => <Option value={item.name}>{item.name}</Option>)
    );
  };

  function searchMatcher({ record, text }) {
    return record?.get('pipelineTask')?.indexOf(text) !== -1;
  }

  const handleClickCreateValue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: {
        width: '740px',
      },
      children: (
        <DeployConfig
          envId={ADDCDTaskDataSet.current.get('envId')}
          appServiceId={appServiceId}
          appServiceName={appServiceName}
          refresh={({ valueId, value }) => {
            ADDCDTaskUseStore.setValueIdRandom(Math.random());
            ADDCDTaskDataSet.current.set('valueId', valueId);
            if (ADDCDTaskDataSet.current.get('type') === typeData[0].value) {
              DeployChartDataSet.current.set(mapping().deployConfig.name, valueId);
              DeployChartDataSet.current.set(mapping().value.name, value);
              initValueIdDataSet(
                deployConfigDataSet,
                appServiceId,
                ADDCDTaskDataSet.current.get('envId'),
                ADDCDTaskUseStore.getValueIdRandom,
              );
            }
            // const origin = ADDCDTaskUseStore.getValueIdList;
            setValueIdValues(value);
          }}
          appSelectDisabled
        />
      ),
      title: '创建部署配置',
      okText: '创建',
    });
  };

  const rendererValueId = ({ value, text, record }) =>
    text === '创建部署配置' ? (
      <a
        style={{
          width: 'calc(100% + 0.24rem)',
          display: 'inline-block',
          position: 'relative',
          right: '0.12rem',
        }}
        role="none"
        onClick={(e) => handleClickCreateValue(e)}
      >
        <span style={{ marginLeft: '0.12rem' }}>{text}</span>
      </a>
    ) : (
      text
    );

  const optionRenderValueId = ({ value, text, record }) => rendererValueId({ text });

  const renderOptionProperty = ({ record }) => ({
    disabled: !record?.get('connect'),
  });

  const renderEnvOption = ({ record, text }) => (
    <>
      <StatusDot size="small" synchronize connect={record?.get('connect')} />
      <span style={{ marginLeft: 5 }}>{text}</span>
    </>
  );

  const renderHostSetting = () => {
    const value = ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.hostSource);
    if (value === addCDTaskDataSetMap.alreadyhost) {
      return [
        <div
          colSpan={1}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
          }}
          newLine
        >
          <Select
            style={{ flex: 1 }}
            name={addCDTaskDataSetMap.host}
            optionRenderer={renderEnvOption}
            onOption={renderOptionProperty}
            onChange={(value2) => {
              const item = ADDCDTaskUseStore.getHostList.find((i) => i.id == value2);
              ADDCDTaskDataSet.current.set('hostIp', item.hostIp);
              ADDCDTaskDataSet.current.set('hostPort', item.sshPort);
            }}
          />
          {/* <div style={{ flex: 1, marginLeft: 16 }}>
            <TextField style={{ width: '100%' }} name="hostIp" />
          </div>
          <div style={{ flex: 1, marginLeft: 16 }}>
            <TextField style={{ width: '100%' }} name="hostPort" />
          </div> */}
        </div>,
      ];
    }
    return '';
    // return [
    //   <TextField newLine colSpan={1} name="hostIp" />,
    //   <TextField colSpan={1} name="hostPort" />,
    //   <SelectBox colSpan={1} name="authType" className="addcdTask-mode">
    //     <Option value="accountPassword">用户名与密码</Option>
    //     <Option value="accountKey">用户名与密钥</Option>
    //   </SelectBox>,
    //   <TextField colSpan={1} newLine name="username" />,
    //     ADDCDTaskDataSet?.current?.get('authType')
    //     === 'accountPassword' ? (
    //       <Password colSpan={1} name="password" />
    //       ) : (
    //         [
    //           <p newLine colSpan={1} className="addcdTask-accountKeyP">
    //             密钥
    //           </p>,
    //           <YamlEditor
    //             colSpan={2}
    //             newLine
    //             readOnly={false}
    //             value={accountKeyValue}
    //             modeChange={false}
    //             onValueChange={(data) => setAccountKeyValue(data)}
    //           />,
    //         ]
    //       ),
    // ];
  };

  /**
   * 修改配置信息事件
   */
  const handleChangeValueIdValues = (data) => {
    const { value, valueIdList, valueId } = data;
    let tempValues = value ? value : valueIdValues;
    const item = (valueIdList ? valueIdList : ADDCDTaskUseStore.getValueIdList).find(
      (i) => String(i.id) === String(valueId ? valueId : ADDCDTaskDataSet.current.get('valueId')),
    );
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: `修改部署配置"${item?.name || ''}"的配置信息`,
      children: (
        <div
          style={{
            maxHeight: 500,
          }}
        >
          <YamlEditor
            colSpan={3}
            newLine
            readOnly={false}
            className="addcdTask-yamleditor"
            onValueChange={(data) => {
              tempValues = data;
            }}
            value={tempValues}
          />
        </div>
      ),
      style: {
        width: '740px',
      },
      okText: '修改',
      onOk: async () => {
        await axios.post(`/devops/v1/projects/${projectId}/deploy_value`, {
          ...(valueIdList ? valueIdList : ADDCDTaskUseStore.getValueIdList).find(
            (i) =>
              String(i.id) === String(valueId ? valueId : ADDCDTaskDataSet.current.get('valueId')),
          ),
          value: tempValues,
        });
        ADDCDTaskUseStore.setValueIdRandom(Math.random());
        setValueIdValues(tempValues);
        if (data) {
          const item = DeployChartDataSet.current.getField(mapping().deployConfig.name).options.records.find((item) => item.get('id') === data.valueId);
          if (item) {
            item.set('value', tempValues);
          }
          DeployChartDataSet.current.set(mapping().deployConfig.name, data.valueId);
          DeployChartDataSet.current.set(mapping().value.name, tempValues);
        }
      },
      onCancel: () => {},
    });
  };

  const getOtherConfig = () => {
    function getModeDom() {
      const currentDepoySource = ADDCDTaskDataSet?.current?.get('deploySource');
      const result = {
        customize: (
          <YamlEditor
            colSpan={6}
            newLine
            className="addcdTask-yamleditor"
            readOnly={false}
            value={customValues}
            onValueChange={(data) => setCustomValues(data)}
          />
        ),
        image: [
          <Select
            newLine
            colSpan={3}
            name="deploySource"
            clearButton={false}
            addonAfter={
              <Tips helpText="流水线制品部署表示直接使用所选关联构建任务中产生的镜像进行部署；匹配制品部署则表示可自主选择项目镜像仓库中的镜像，并配置镜像版本的匹配规则，后续部署的镜像版本便会遵循此规则。" />
            }
          >
            <Option value="pipelineDeploy">流水线制品部署</Option>
            <Option value="matchDeploy">匹配制品部署</Option>
          </Select>,
          currentDepoySource === 'pipelineDeploy' && (
            <Select
              colSpan={3}
              name="pipelineTask"
              searchable
              addonAfter={
                <Tips helpText="此处的关联构建任务，仅会查询出该条流水线中存在【Docker构建】步骤的任务。" />
              }
              searchMatcher={searchMatcher}
            >
              {relatedJobOpts.map((item) => (
                <Option value={item.name}>{item.name}</Option>
              ))}
            </Select>
          ),
          currentDepoySource === 'matchDeploy' && <Select colSpan={3} name="repoId" />,
          currentDepoySource === 'matchDeploy' && <Select colSpan={3} name="imageId" />,
          currentDepoySource === 'matchDeploy' && (
            <Select colSpan={3} name="matchType">
              <Option value="refs">模糊匹配</Option>
              <Option value="regex">正则匹配</Option>
              <Option value="exact_match">精确匹配</Option>
              <Option value="exact_exclude">精确排除</Option>
            </Select>
          ),
          currentDepoySource === 'matchDeploy' && <TextField colSpan={3} name="matchContent" />,
          // <TextField colSpan={3} name="containerName" />,
          <YamlEditor
            colSpan={6}
            className="addcdTask-yamleditor"
            newLine
            readOnly={false}
            value={imageDeployValues}
            onValueChange={(data) => setImageDeployValues(data)}
          />,
        ],
        jar: [
          [productTypeData[0].value, productTypeData[1].value].includes(ADDCDTaskDataSet.current.get(fieldMap.productType.name))
            ? [
                <Select
                  newLine
                  colSpan={3}
                  name="deploySource"
                  clearButton={false}
                  addonAfter={
                    <Tips helpText="流水线制品部署表示直接使用所选关联构建任务中生成的jar包进行部署。" />
                  }
                >
                  <Option value="pipelineDeploy">流水线制品部署</Option>
                  <Option value="matchDeploy">匹配制品部署</Option>
                </Select>,
                currentDepoySource === 'pipelineDeploy' && (
                  <Select
                    colSpan={3}
                    name="pipelineTask"
                    searchable
                    addonAfter={
                      <Tips helpText={ADDCDTaskDataSet?.current?.get(fieldMap.productType.name) === productTypeData[1].value
                      ? "此处的关联构建任务，仅会查询出该条流水线中存在【Docker构建】步骤的任务。"
                      : "此处的关联构建任务，仅会查询出该条流水线中存在'上传jar包至制品库'或“Maven发布”步骤的“构建类型”任务。若所选任务中存在多个满足条件的步骤，则只会部署所选任务中第一个满足条件的步骤产生的jar包；"} />
                    }
                    searchMatcher={searchMatcher}
                  >
                    {relatedJobOpts.map((item) => (
                      <Option value={item.name}>{item.name}</Option>
                    ))}
                  </Select>
                ),
                [productTypeData[1].value].includes(ADDCDTaskDataSet.current.get(fieldMap.productType.name)) && (
                  <TextField colSpan={3} name='containerName' />
                )
              ]
            : '',
          currentDepoySource === 'matchDeploy' && <Select colSpan={3} name="serverName" />,
          currentDepoySource === 'matchDeploy' && <Select colSpan={3} name="repositoryId" />,
          currentDepoySource === 'matchDeploy' && <Select colSpan={3} name="groupId" />,
          currentDepoySource === 'matchDeploy' && <Select colSpan={3} name="artifactId" />,
          currentDepoySource === 'matchDeploy' && (
            <TextField
              colSpan={6}
              name="versionRegular"
              addonAfter={
                <Tips helpText="正则表达式匹配版本名，默认值^*master*$，参考demo如下：^*master*$:模糊匹配版本名包含master，^hotfix-0.21.1$：精确匹配版本名为hotfix-0.21.1" />
              }
            />
          ),
          // <TextField
          //   addonAfter={(
          //     <Tips
          //       helpText={(
          //         <>
          //           <p style={{ margin: 0 }}>
          //             默认工作目录，当前工作目录(./)，jar包下载存放目录为：./temp-jar/xxx.jar 日志存放目录为：./temp-log/xxx.log
          //           </p>
          //           <p style={{ margin: 0 }}>
          //             填写工作目录，jar包下载存放目录为：工作目录/temp-jar/xxx.jar 日志存放目录为：工作目录/temp-jar/xxx.log
          //           </p>
          //         </>
          //       )}
          //     />
          //   )}
          //   colSpan={3}
          //   name="workingPath"
          // />,
          // <TextField colSpan={3} name="appInstanceName" />,
          [productTypeData[0].value, productTypeData[2].value].includes(ADDCDTaskDataSet.current.get(fieldMap.productType.name)) ?
          <OperationYaml
            colSpan={6}
            newLine
            hasGuide={ADDCDTaskDataSet.current.get(fieldMap.productType.name) === productTypeData[2].value}
            dataSet={ADDCDTaskDataSet}
            // configDataSet={configDataSet}
            // optsDS={configCompareOptsDS}
            preName={fieldMap.preCommand.name}
            startName={fieldMap.runCommand.name}
            postName={fieldMap.postCommand.name}
            deleteName={fieldMap.killCommand.name}
            healthName={fieldMap.healthProb.name}
          /> : (
              <YamlEditor
                colSpan={6}
                // className="addcdTask-yamleditor"
                newLine
                showError={false}
                readOnly={false}
                value={ADDCDTaskDataSet.current.get(fieldMap.dockerCommand.name)}
                onValueChange={(data) => ADDCDTaskDataSet.current.set(fieldMap.dockerCommand.name, data)}
              />
            ),
          // <YamlEditor
          //   colSpan={6}
          //   newLine
          //   className="addcdTask-yamleditor"
          //   readOnly={false}
          //   value={jarValues}
          //   onValueChange={(data) => setJarValues(data)}
          // />,
        ],
      };
      if (ADDCDTaskDataSet.current.get(fieldMap.productType.name) === productTypeData[3].value) {
        return [
          <Select
            colSpan={3}
            name="pipelineTask"
            searchable
            addonAfter={
              <Tips helpText="此处的关联构建任务，仅会查询出该条流水线中存在【Docker构建】步骤的任务。" />
            }
            searchMatcher={searchMatcher}
          >
            {relatedJobOpts.map((item) => (
              <Option value={item.name}>{item.name}</Option>
            ))}
          </Select>,
          <p
            colSpan={6} 
            className="c7ncd-operationYaml-dockerCompose-title"
          >
            docker-compose.yml文件
            <NewTips
              style={{
                position: 'relative',
                bottom: 1,
              }}
              helpText="此处的docker-compose.yml文件默认展示为所选应用中的yaml文件内容，且暂不支持修改。"
            />
          </p>,
          <YamlEditor
            colSpan={6}
            // className="addcdTask-yamleditor"
            newLine
            modeChange={false}
            showError={false}
            readOnly
            value={ADDCDTaskDataSet.current.get(fieldMap.dockerCompose.name)}
            // onValueChange={(data) => ADDCDTaskDataSet.current.set(fieldMap.dockerCompose.name, data)}
          />,
          <p
            colSpan={6} 
            className="c7ncd-operationYaml-dockerCompose-title"
          >
            命令
            <NewTips
              style={{
                position: 'relative',
                bottom: 1,
              }}
              helpText="您需在此处维护操作Docker Compose的命令，此处维护的命令不会影响到主机应用中的命令；仅生效于此处的流水线主机部署任务。"
            />
          </p>,
          <YamlEditor
            colSpan={6}
            // className="addcdTask-yamleditor"
            newLine
            modeChange={false}
            showError={false}
            readOnly={false}
            value={ADDCDTaskDataSet.current.get(fieldMap.dockerComposeRunCommand.name)}
            onValueChange={(data) => ADDCDTaskDataSet.current.set(fieldMap.dockerComposeRunCommand.name, data)}
          />
        ]
      }
      return result['jar'];
    }
    const obj = {
      cdDeploy: [
        <div className="addcdTask-divided" />,
        <p className="addcdTask-title">配置信息</p>,
        <Form className="addcdTask-form2" columns={3} dataSet={ADDCDTaskDataSet}>
          <Select
            colSpan={2}
            name="valueId"
            onChange={(data) => {
              const origin = ADDCDTaskUseStore.getValueIdList;
              setValueIdValues(origin.find((i) => i.id === data).value);
            }}
            optionRenderer={optionRenderValueId}
            renderer={rendererValueId}
            className="addCdTask-form2-valueId"
          />
          <div newLine colSpan={3}>
            <Icon style={{ color: 'rgb(244, 67, 54)' }} type="error" />
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'PingFangSC-Regular, PingFang SC',
                fontWeight: 400,
                color: 'var(--text-color3)',
                lineHeight: '20px',
              }}
            >
              修改配置信息后，所选的部署配置中的配置信息也将随之改动。
            </span>
            <Button
              funcType="flat"
              color="blue"
              icon="edit-o"
              onClick={handleChangeValueIdValues}
              disabled={!ADDCDTaskDataSet.current.get('valueId')}
            >
              修改配置信息
            </Button>
          </div>
          <YamlEditor
            colSpan={3}
            newLine
            readOnly
            className="addcdTask-yamleditor"
            // onValueChange={(data) => {
            //   setValueIdValues(data);
            // }}
            value={valueIdValues}
          />
        </Form>,
      ],
      // TODO: 更新应用- 获取instanceId
      cdHost: [
        <Form className="addcdTask-cdHost" dataSet={ADDCDTaskDataSet}>
          <SelectBox className="addcdTask-cdHost-productType" name={fieldMap.productType.name} />
          <SelectBox
            newLine
            name={fieldMap.deployWay.name}
            onChange={(value) => {
              HostJarDataSet.deleteAll(false);
              ADDCDTaskDataSet.getField(addCDTaskDataSetMap.host).set(
                'disabled',
                value === deployWayData[1].value,
              );
            //   if (isQueryDeployConfig && value === 'update' && value !== oldValue) {
            //     setOldValue(value);
            //     handleInitDeployConfig(HostJarDataSet.current.get('appName'));
            //   }
            }}
          />
        </Form>,
        <div className="addcdTask-divided" />,
        <p
         className="addcdTask-title"
         style={{
           marginBottom: 20,
         }}
         >应用信息</p>,
        <Form columns={2} dataSet={HostJarDataSet}>
          {ADDCDTaskDataSet.current.get(fieldMap.deployWay.name) === deployWayData[0].value ? (
            <TextField name="appName" />
          ) : (
            <Select
              name="appName"
              onChange={(value) => {
                handleInitDeployConfig(value);
              }}
            />
          )}
          <TextField name="appCode" />
        </Form>,
        <div className="addcdTask-divided" />,
        // <div className="addcdTask-divided" />,
        // <p className="addcdTask-title">主机设置</p>,
        // <Form
        //   className="addcdTask-cdHost"
        //   columns={2}
        //   dataSet={ADDCDTaskDataSet}
        // >
        //   <SelectBox
        //     style={{ top: "16px" }}
        //     colSpan={1}
        //     name={addCDTaskDataSetMap.hostSource}
        //     onChange={() => {
        //       ADDCDTaskDataSet.current.set(addCDTaskDataSetMap.host, undefined);
        //       ADDCDTaskDataSet.current.set("hostIp", undefined);
        //       ADDCDTaskDataSet.current.set("hostPort", undefined);
        //     }}
        //   >
        //     <Option value={addCDTaskDataSetMap.alreadyhost}>已有主机</Option>
        //     {/* <Option value={addCDTaskDataSetMap.customhost}>自定义主机</Option> */}
        //   </SelectBox>
        //   {renderHostSetting()}
        //   {/* <div newLine colSpan={2} style={{ display: 'flex', alignItems: 'center' }}>
        //     <Button
        //       disabled={
        //         ADDCDTaskDataSet.current.get(
        //           addCDTaskDataSetMap.hostSource,
        //         ) === addCDTaskDataSetMap.customhost
        //           ? (!ADDCDTaskDataSet.current.get('hostIp')
        //         || !ADDCDTaskDataSet.current.get('hostPort')
        //         || !ADDCDTaskDataSet.current.get('username'))
        //         : !ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.host)
        //       }
        //       onClick={handleTestConnect}
        //       style={{ marginRight: 20 }}
        //       color="primary"
        //       funcType="raised"
        //     >
        //       测试连接
        //     </Button>
        //     {getTestDom()}
        //   </div> */}
        // </Form>,
        // <div className="addcdTask-divided" />,
        <p className="addcdTask-title">主机部署</p>,
        <Form style={{ marginTop: 20 }} columns={6} dataSet={ADDCDTaskDataSet}>
          {/* <SelectBox
            className="addcdTask-mainMode"
            colSpan={5}
            name="hostDeployType"
            onChange={(data) => {
              ADDCDTaskDataSet.current.set("hostDeployType", data);
              if (data !== "customize") {
                ADDCDTaskDataSet.current.set("deploySource", "pipelineDeploy");
                // console.log(ADDCDTaskDataSet.getField('pipelineTask'));
                // ADDCDTaskDataSet.current.set('pipelineTask', '123');
              }
            }}
          >
            <Option value="image">镜像部署</Option>
            <Option value="jar">jar包部署</Option>
            <Option value="customize">自定义命令</Option>
          </SelectBox> */}
          <Select
            colSpan={3}
            searchable
            searchMatcher="search_param"
            name={addCDTaskDataSetMap.host}
            optionRenderer={renderEnvOption}
            onOption={renderOptionProperty}
          />
          {getModeDom()}
        </Form>,
      ],
      [addCDTaskDataSetMap.apiTest]: [
        // <div className="addcdTask-divided" />,
        // <p className="addcdTask-title">执行设置</p>,
        // <Form style={{ marginTop: 20 }} columns={2} dataSet={ADDCDTaskDataSet}>
        //   <div className="addcdTask-whetherBlock" style={{ position: 'relative' }}>
        //     <SelectBox name={addCDTaskDataSetMap.whetherBlock}>
        //       <Option value>是</Option>
        //       <Option value={false}>否</Option>
        //     </SelectBox>
        //     <Tooltip title={(
        //       <>
        //         <p>若选择为是，则表示API测试任务在执行的过程中，后续的阶段与任务将不会执行</p>
        //         <p>若选择为否，则表示在执行API测试任务的同时，会同步执行接下来的任务或阶段</p>
        //       </>
        //     )}
        //     >
        //       <Icon
        //         style={{
        //           position: 'absolute',
        //           top: '-18px',
        //           left: '136px',
        //           color: 'rgba(0, 0, 0, 0.36)',
        //         }}
        //         type="help"
        //       />
        //     </Tooltip>
        //   </div>
        // </Form>,
        <div className="addcdTask-divided" />,
        <p className="addcdTask-title">
          告警设置
          <Tooltip title="启用告警设置后，若该API测试任务的执行率低于某个设定值，便会通过邮件或站内信通知到指定的通知对象。">
            <Icon
              style={{
                position: 'relative',
                bottom: '2px',
                marginLeft: '5px',
                color: 'rgba(0, 0, 0, 0.36)',
              }}
              type="help"
            />
          </Tooltip>
        </p>,
        <Form style={{ marginTop: 20 }} columns={2} dataSet={ADDCDTaskDataSet}>
          <div className="addcdTask-whetherBlock" style={{ position: 'relative' }}>
            <SelectBox name={addCDTaskDataSetMap.alarm}>
              <Option value>是</Option>
              <Option value={false}>否</Option>
            </SelectBox>
          </div>
          {ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.alarm) && [
            <NumberField
              name={addCDTaskDataSetMap.threshold}
              newLine
              suffix="%"
              step={1}
              min={0}
              max={100}
              addonAfter={
                <Tips helpText="即指定一个执行成功率的标准值，若后续在流水线中执行该API测试任务后成功率低于设定值，便会告警通知到指定人员。仅能填入0-100。" />
              }
              onChange={(value) => {
                if (Number(value) > 100) {
                  ADDCDTaskDataSet.current.set(addCDTaskDataSetMap.threshold, '100');
                } else if (Number(value) < 0) {
                  ADDCDTaskDataSet.current.set(addCDTaskDataSetMap.threshold, '0');
                }
              }}
            />,
            <Select
              searchable
              searchMatcher="param"
              newLine
              name={addCDTaskDataSetMap.notifyObject}
              addonAfter={<Tips helpText="可选择项目下任意人员作为通知对象。" />}
            />,
            <SelectBox newLine name={addCDTaskDataSetMap.notifyWay}>
              <Option value="sendEmail">邮件</Option>
              <Option value="sendSiteMessage">站内信</Option>
            </SelectBox>,
            <div className="addcdTask-whetherBlock" style={{ position: 'relative' }}>
              <SelectBox name={addCDTaskDataSetMap.whetherBlock}>
                <Option value>是</Option>
                <Option value={false}>否</Option>
              </SelectBox>
              <Tooltip
                title={
                  <>
                    <p>
                      若选择为是，则表示API测试任务执行成功率低于设定值后，后续的阶段与任务将被阻塞，不会执行。
                    </p>
                    <p>
                      若选择为否，则表示无论执行成功率如何，此任务执行完成后，均会继续执行接下来的阶段或任务。
                    </p>
                  </>
                }
              >
                <Icon
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '170px',
                    color: 'rgba(0, 0, 0, 0.36)',
                  }}
                  type="help"
                />
              </Tooltip>
            </div>,
          ]}
        </Form>,
      ],
      [typeData[0].value]: [
        <div className="addcdTask-divided" />,
        <DeployChart
          deployWay={ADDCDTaskDataSet.current.get(fieldMap.deployWay.name)}
          dataSet={DeployChartDataSet}
          optionRenderValueId={optionRenderValueId}
          rendererValueId={rendererValueId}
          handleChangeValueIdValues={handleChangeValueIdValues}
        />,
      ],
      [typeData[1].value]: [
        <div className="addcdTask-divided" />,
        <DeployGroup
          changeDetail={setDeployGroupDetail}
          deployWay={ADDCDTaskDataSet.current.get(fieldMap.deployWay.name)}
          dataSet={DeployGroupDataSet}
          cRef={deployGroupcRef}
          detail={deployGroupDetail}
          preJobList={preJobList}
        />,
      ],
    };
    return obj[ADDCDTaskDataSet?.current?.get('type')];
  };

  const renderderAuditUsersList = ({ text, record }) => {
    const ldap = record?.get('ldap');
    const str = ldap ? `${text}(${record?.get('loginName')})` : `${text}(${record?.get('email')})`
    return <Tooltip title={str}>
      {str}
    </Tooltip>
  };

  /**
   * 外部卡点回调地址的复制事件
   */
  const handleCopy = () => {
    Choerodon.prompt('复制成功');
  };

  const getBranchsList = useCallback(async () => {
    const url = `devops/v1/projects/${projectId}/app_service/${appServiceId}/git/page_branch_by_options?page=1&size=${currentSize}`;
    const res = await axios.post(url);
    if (res.content.length % 10 === 0 && res.content.length !== 0) {
      res.content.push({
        name: '加载更多',
        value: 'more',
      });
    }
    setBranchsList(
      res.content.map((c) => {
        if (c.branchName) {
          c.name = c.branchName;
          c.value = c.branchName;
        }
        return c;
      }),
    );
  }, [appServiceId, projectId]);

  const renderderBranchs = ({ text }) =>
    text === '加载更多' ? (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <a
        style={{ width: '100%', height: '100%', display: 'block' }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          currentSize += 10;
          getBranchsList();
        }}
      >
        {text}
      </a>
    ) : (
      text
    );

  function renderTriggerTypeTips() {
    const type = ADDCDTaskDataSet.current.get('triggerType');
    switch (type) {
      case 'refs':
        return '您可在此选择或输入触发该任务的分支类型；支持多填多选；若不填写，则默认为所有分支和tag';
      case 'exact_match':
        return '您可在此精确选择或输入触发该任务的具体分支名称；支持多填多选；若不填写，则默认为所有分支和tag';
      default:
        return '您可在此选择或输入某几个具体的分支名称以此来精确排除；此处支持多填多选；若不填写，则默认为没有需要排除的分支或tag';
    }
  }

  const renderer = ({ record, text }) => (
    <span>
      {text && (
        <i
          style={{
            display: 'inline-block',
            marginRight: 3,
            width: '0.08rem',
            height: '0.08rem',
            borderRadius: '50%',
            backgroundColor: record?.get('connected') ? 'rgb(0, 191, 165)' : '#ff9915',
          }}
        />
      )}
      {text}
    </span>
  );

  const optionRenderer = ({ record, text, value }) => (
    <Tooltip title={!record?.get('connected') && '未连接'}>
      {renderer({ record, text, value })}
    </Tooltip>
  );

  /**
   * 渲染关联部署任务options
   */
  const renderRelatedMission = () => {
    let lists = [];
    JSON.parse(JSON.stringify(pipelineStageMainSource)).forEach((i, iIndex) => {
      // 是cd阶段
      if (i.type === 'CD') {
        // 如果遍历列小于当前列 则直接存入joblist
        if (iIndex < columnIndex - 1) {
          lists = [...lists, ...i?.jobList || []];
        } else {
          //  如果遍历列是当切列
          lists = [...lists, ...i?.jobList?.splice(0, taskIndex || witchColumnJobIndex) || []];
        }
      }
    });
    // 返回任务是部署任务的options
    return lists
      .filter((l) => l.type === 'cdDeploy')
      .map((i) => <Option value={i.name}>{i.name}</Option>);
  };

  const getauditUsersSearchMatcher = ({record, text , textField})=>{ // 后端加了分页， 这里改成 user object 
    return record.get(textField) && (record.get(textField).indexOf(text) !== -1 || 
    record.get('loginName').indexOf(text) !== -1
    )
  }

  return (
    <div className="addcdTask">
      <Form columns={6} dataSet={ADDCDTaskDataSet}>
        <TextField colSpan={3} name="name" />
        <TextField colSpan={3} name="glyyfw" />
        <div className="addcdTask-wrap" colSpan={6}>
          <Select
            name="triggerType"
            className="addcdTask-triggerType"
            onChange={() => ADDCDTaskDataSet.current.set('triggerValue', undefined)}
            colSpan={2}
            clearButton={false}
          >
            <Option value="refs">分支类型匹配</Option>
            <Option value="regex">正则匹配</Option>
            <Option value="exact_match">精确匹配</Option>
            <Option value="exact_exclude">精确排除</Option>
          </Select>
          {ADDCDTaskDataSet.current.get('triggerType') === 'regex' ? (
            <TextField
              className="addcdTask-triggerValue"
              name="triggerValue"
              addonAfter={
                <NewTips helpText="您可在此输入正则表达式来配置触发分支；例：若想匹配以 feature 开头的分支，可以输入 ^feature.*。更多表达式，详见用户手册。若不填写，则默认为所有分支和tag" />
              }
            />
          ) : (
            <Select
              combo
              searchable
              multiple
              className="addcdTask-triggerValue"
              name="triggerValue"
              addonAfter={<Tips helpText={renderTriggerTypeTips()} />}
              searchMatcher="branchName"
              optionRenderer={({ text }) => renderderBranchs({ text })}
              maxTagCount={3}
              maxTagPlaceholder={(omittedValues) => (
                <Tooltip title={omittedValues.join(',')}>{`+${omittedValues.length}`}</Tooltip>
              )}
              renderer={renderderBranchs}
              colSpan={4}
            >
              {branchsList?.map((b) => <Option value={b.value}>{b.name}</Option>)}
            </Select>
          )}
        </div>
        {ADDCDTaskDataSet.current.get('type') === addCDTaskDataSetMap.apiTest && [
          <SelectBox
            name={fieldMap.relativeObj.name}
            colSpan={3}
          />,
            ADDCDTaskDataSet?.current?.get(fieldMap.relativeObj.name) === relativeObjData[0].value ? (
              <Select
            newLine
            colSpan={3}
            searchable
            searchMatcher="task_name"
            name={addCDTaskDataSetMap.apiTestMission}
            optionRenderer={({ record, text }) => {
              if (!record?.get('executeOnline')) {
                return (
                    <Tooltip title="含有自定义脚本，无法选择">
                      {text}
                    </Tooltip>
                )
              } else {
                return text
              }
            }}
            onOption={({ record }) => ({
              disabled: !record?.get('executeOnline')
            })}
            addonAfter={<Tips helpText="此处仅能从项目下已有的API测试任务中进行选择" />}
          />
            ) : (
              <Select
                name={fieldMap.kits.name}
                colSpan={3}
                newLine
              />
            ),
          ADDCDTaskDataSet?.current?.get(fieldMap.relativeObj.name) === relativeObjData[0].value && (
            <Select colSpan={3} name="apiTestConfigId" />
          ),
          <Select
            colSpan={3}
            name={addCDTaskDataSetMap.relativeMission}
            addonAfter={
              <Tips
                helpText={
                  <>
                    <p>
                      1. 此处为非必选，若不选关联部署任务，则代表，API测试任务在执行前不会做任何判断
                    </p>
                    <p>
                      2. 此处仅支持选择该任务之前的任一部署任务；
                      选择后，在执行此API测试任务前便会校验：关联的部署任务中对应的新版本是否已部署成功。只有该版本对应的pod状态为可用时，测试任务才会执行
                    </p>
                  </>
                }
              />
            }
          >
            {renderRelatedMission()}
          </Select>,
        ]}
        {[typeData[0].value, typeData[1].value].includes(
          ADDCDTaskDataSet?.current?.get('type'),
        ) && [
          <Select
            colSpan={3}
            name="envId"
            onChange={() => {
              DeployChartDataSet?.current?.set(deployChartMapping().deployConfig.name, undefined);
              DeployChartDataSet?.current?.set(deployChartMapping().value.name, undefined);
              DeployChartDataSet.current.set(deployChartMapping().appName.name, undefined)
            }}
            optionRenderer={optionRenderer}
            // renderer={renderer}
            onOption={({ record }) => ({
              disabled: !record?.get('connected'),
            })}
          />,
          isProjectOwner && (
          <div
            className="addcdTask-whetherBlock addcdTask-triggersTasks"
            style={{
              position: 'relative',
            }}
            colSpan={3}
          >
            <SelectBox name={addCDTaskDataSetMap.triggersTasks.name}>
              <Option value={addCDTaskDataSetMap.triggersTasks.values[0]}>是</Option>
              <Option value={addCDTaskDataSetMap.triggersTasks.values[1]}>否</Option>
            </SelectBox>
            <NewTips
              helpText="此处仅项目所有者可以设置；默认为是，即触发用户在没有该部署任务的环境权限时，将会直接使用管理员账户触发部署；若选择为否，触发成员在没有环境权限时，将会直接跳过此部署任务。"
              style={{
                position: 'absolute',
                top: '7px',
                left: '195px',
              }}
            />
          </div>
          ),
          <SelectBox
            colSpan={3}
            name={fieldMap.deployWay.name}
            onChange={(value) => {
              DeployGroupDataSet.current.set(deployGroupMapping().appName.name, undefined);
              DeployGroupDataSet.current.set(deployGroupMapping().appCode.name, undefined);
              DeployChartDataSet.current.set(deployChartMapping().appName.name, undefined);
              DeployChartDataSet.current.set(deployChartMapping().appCode.name, undefined);
            }}
          />,
        ]}
        {ADDCDTaskDataSet?.current?.get('type') === 'cdAudit' && (
          <div colSpan={3} style={{ display: 'flex' }}>
            <div style={{ width: '47.5%', marginRight: 8 }} colSpan={2}>
              <Select
                popupCls="addcdTask-auditUsers"
                searchable
                style={{ width: '100%' }}
                name="cdAuditUserIds"
                maxTagCount={3}
                searchMatcher= {getauditUsersSearchMatcher}
                onOption={({ record }) => ({
                  disabled: record?.get('id') === 'more',
                })}
                // onChange={() => {
                //   handleClickMore(null);
                // }}
                maxTagPlaceholder={(omittedValues) => {
                  const tempArr = omittedValues.map((item) => {
                    const tempId = typeof item === 'string' ? item : item?.id;
                    return ADDCDTaskDataSet.getField('cdAuditUserIds').getText(tempId);
                  });
                  return (
                    <Tooltip title={tempArr && tempArr.join('，')}>
                      <span style={{ width: '31px', display: 'block' }}>
                        {`+${omittedValues.length}`}
                        ...
                      </span>
                    </Tooltip>
                  );
                }}
                optionRenderer={renderderAuditUsersList}
                renderer={({ text, value }) => {
                  if (typeof value === 'object') {
                    const isLdap = get(value, 'ldap');
                    return (
                      <Tooltip
                        title={
                          isLdap
                            ? `${value.realName}(${value.loginName})`
                            : `${value.realName}(${value.email})`
                        }
                      >
                        {value.realName}
                      </Tooltip>
                    );
                  }
                  return <Tooltip title={text}>{text}</Tooltip>;
                }}
              />
            </div>
            {ADDCDTaskDataSet?.current?.get('cdAuditUserIds')?.length > 1 && (
              <div style={{ width: 'calc(100% - 47.5% - 8px)' }} colSpan={1}>
                <Select
                  style={{ width: '100%' }}
                  name="countersigned"
                  addonAfter={
                    <Tips helpText="会签模式中，需要所有审核人员都审核通过才能通过，审核人员中任一人点击终止，则流水线终止；或签模式中，仅需任一审核人员审核即可，即第一个审核的人点击通过则通过，点击终止则终止" />
                  }
                >
                  <Option value={1}>会签</Option>
                  <Option value={0}>或签</Option>
                </Select>
              </div>
            )}
          </div>
        )}
        {ADDCDTaskDataSet.current.get('type') === addCDTaskDataSetMap.externalStuck && [
          <div colSpan={6} className="addcdTask-missionDes">
            <span style={{ fontWeight: 500 }}>任务说明：</span>
            <span style={{ display: 'inline-block' }}>
              - 外部卡点任务用于对接Choerodon平台外的工作流或系统。此任务触发时，
              会默认将projectId、pipelineRecordId、stageRecordId 、jobRecordId、callback_token、
              currentCdJob以及pipelineRecordDetails发送至外部地址。
            </span>
            <span style={{ display: 'inline-block' }}>
              - 外部系统执行结束后，会往{' '}
              <span className="addcdTask-missionDes-focus">流水线回调地址</span>{' '}
              发送一个状态来作为外部卡点的任务状态。成功后会接着执行后续任务，失败则停留在此任务。
            </span>
            <br />
            <span style={{ display: 'block', marginTop: 10, fontWeight: 500 }}>
              流水线回调地址参数说明：
            </span>
            <span style={{ display: 'block' }}>- pipelineRecordId： 流水线记录id</span>
            <span style={{ display: 'block' }}>- stageRecordId: 流水线阶段记录id</span>
            <span style={{ display: 'block' }}>- jobRecordId: 流水线任务记录id</span>
            <span style={{ display: 'block' }}>- callback_token: 回调时的认证token</span>
            <span style={{ display: 'block' }}>
              - approval_status： 任务执行状态（true/false ,代表外部卡点任务执行成功或失败）
            </span>
          </div>,
          <TextField
            label="流水线回调地址"
            colSpan={6}
            addonAfter={
              <CopyToClipboard text={pipelineCallbackAddress} onCopy={handleCopy}>
                <Icon style={{ cursor: 'pointer' }} type="content_copy" />
              </CopyToClipboard>
            }
            disabled
            required
            value={pipelineCallbackAddress}
          />,
          <TextArea name={addCDTaskDataSetMap.externalAddress} colSpan={6} />,
          <TextArea name={addCDTaskDataSetMap.externalToken} colSpan={6} />,
          <TextArea name={addCDTaskDataSetMap.missionDes} colSpan={6} />,
        ]}
      </Form>
      {getOtherConfig()}
    </div>
  );
});
