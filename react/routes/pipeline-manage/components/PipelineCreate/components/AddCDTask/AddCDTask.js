/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-param-reassign */
/* eslint-disable no-template-curly-in-string */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Form,
  Select,
  TextField,
  SelectBox,
  Password,
  Tooltip,
  Button,
  Modal,
  TextArea,
} from 'choerodon-ui/pro';
import { Icon, Spin } from 'choerodon-ui';
import { axios, Choerodon } from '@choerodon/boot';
import { Base64 } from 'js-base64';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { observer } from 'mobx-react-lite';
import DeployConfig from '@/components/deploy-config';
import JSONbig from 'json-bigint';
import { get } from 'lodash';
import addCDTaskDataSetMap from './stores/addCDTaskDataSetMap';
import { useAddCDTaskStore } from './stores';
import YamlEditor from '../../../../../../components/yamlEditor';
import Tips from '../../../../../../components/new-tips';
import './index.less';

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
    PipelineCreateFormDataSet,
    AppState,
    AppState: {
      currentMenuType: { projectId },
    },
    modal,
    ADDCDTaskUseStore,
    handleOk,
    jobDetail,
    pipelineStageMainSource,
    columnIndex,
    witchColumnJobIndex,
  } = useAddCDTaskStore();

  const [branchsList, setBranchsList] = useState([]);
  const [valueIdValues, setValueIdValues] = useState('');
  const [customValues, setCustomValues] = useState('# 自定义ssh指令\n# 比如部署镜像\n# 需要包括部署镜像指令以及二次触发部署的停用删除逻辑\ndocker stop mynginx & docker rm mynginx & docker run --name mynginx -d nginx:latest');
  const [imageDeployValues, setImageDeployValues] = useState('# docker run指令\n# 不可删除${containerName}和${imageName}占位符\n# 不可删除 -d: 后台运行容器\n# 其余参数可参考可根据需要添加\ndocker run --name=${containerName} -d ${imageName}');
  const [jarValues, setJarValues] = useState('# java -jar指令\n'
    + '# 不可删除${jar}\n'
    + '# java -jar 后台运行参数会自动添加 不需要在重复添加\n'
    + '# 其余参数可参考可根据需要添加\n'
    + 'java -jar ${jar}\n'
    + '# 默认工作目录，当前工作目录(./)，jar包下载存放目录为：./temp-jar/xxx.jar 日志存放目录为：./temp-log/xxx.log\n'
    + '# 填写工作目录，jar包下载存放目录为：工作目录/temp-jar/xxx.jar 日志存放目录为：工作目录/temp-jar/xxx.log\n'
    + '# 请确保用户有该目录操作权限');
  const [testStatus, setTestStatus] = useState('');
  const [accountKeyValue, setAccountKeyValue] = useState('');
  const [relatedJobOpts, setRelatedJobOpts] = useState([]);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [pipelineCallbackAddress, setPipelineCallbackAddress] = useState(undefined);

  useEffect(() => {
    ADDCDTaskUseStore.setValueIdRandom(Math.random());
    axios.get(`/iam/choerodon/v1/projects/${projectId}/check_admin_permission`).then((res) => {
      setIsProjectOwner(res);
    });
    axios.get('/devops/v1/cd_pipeline/external_approval_task/callback_url').then((res) => {
      setPipelineCallbackAddress(res);
    });
  }, []);

  useEffect(() => {
    const currentHostDeployType = ADDCDTaskDataSet?.current?.get(
      'hostDeployType'
    );
    const tempArr = pipelineStageMainSource
      && pipelineStageMainSource.length > 0
      && pipelineStageMainSource.map((item) => item?.jobList.slice());
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
    if (filterArr && filterArr.length === 1) {
      if (typeof filterArr[0] === 'object') {
        ADDCDTaskDataSet.current.set('pipelineTask', filterArr[0].name);
      }
    }
    if (filterArr
      && filterArr.length > 0) {
      setRelatedJobOpts(filterArr);
    } else {
      setRelatedJobOpts([]);
    }
  }, [ADDCDTaskDataSet?.current?.get(
    'hostDeployType'
  ), pipelineStageMainSource]);

  useEffect(() => {
    if (relatedJobOpts && relatedJobOpts.length === 1) {
      ADDCDTaskDataSet.current.set('pipelineTask', relatedJobOpts[0].name);
    } else {
      ADDCDTaskDataSet.current.init('pipelineTask');
    }
  }, [relatedJobOpts, ADDCDTaskDataSet?.current?.get(
    'hostDeployType')]);

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
      type === 'cdHost' && ['image', 'jar'].includes(hostDeployType)
      && deploySource === 'pipelineDeploy'
      && pipelineTask
      && relatedJobOpts
      && relatedJobOpts.length > 0) {
      const { triggerType, triggerValue } = relatedJobOpts.find((i) => i.name === pipelineTask);
      ADDCDTaskDataSet.current.set('triggerType', triggerType);
      ADDCDTaskDataSet.getField('triggerType').set('disabled', true);
      ADDCDTaskDataSet.current.set('triggerValue', triggerValue?.split(','));
      setBranchsList(triggerValue?.split(',').map((i) => ({
        value: i,
        name: i,
      })));
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

  function getMetadata(ds) {
    if (ds.type === 'cdDeploy') {
      ds.value = Base64.encode(valueIdValues);
      // 如果部署模式是新建 则删掉多余的实例id
      if (ds.deployType && ds.deployType === 'create') {
        delete ds.instanceId;
      } else {
        // 如果是替换 则除了传id 还需要传对应的name
        const instanceName = ADDCDTaskUseStore.getInstanceList
          ?.find((i) => i.id === ds.instanceId)?.code;
        ds.instanceName = instanceName;
      }
    }
    if (ds.type === addCDTaskDataSetMap.apiTest) {
      ds.apiTestTaskName = ADDCDTaskUseStore.getApiTestArray
        .find((i) => i.id == ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.apiTestMission)).name;
      ds[addCDTaskDataSetMap.relativeMission] = ADDCDTaskDataSet
        .current
        .get(addCDTaskDataSetMap.relativeMission);
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
        password: ds.authType === 'accountPassword' ? ds.password : (accountKeyValue && Base64.encode(accountKeyValue)),
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
            (i) => String(i.repoId) === String(ds.repoId)
          );
          const img = ADDCDTaskUseStore.getImageList?.find(
            (i) => String(i.imageId) === String(ds.imageId)
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
            value: Base64.encode(jarValues),
          };
        }
        ds.jarDeploy.workingPath = ds.workingPath;
      }
    }

    ds.appServiceId = PipelineCreateFormDataSet.current.get('appServiceId');
    return JSON.stringify(ds).replace(/"/g, "'");
  }

  const handleAdd = async () => {
    const result = await ADDCDTaskDataSet.current.validate(true);
    if (result) {
      const ds = JSON.parse(JSON.stringify(ADDCDTaskDataSet.toData()[0]));
      if (ds.type === 'cdHost') {
        if (!(await handleTestConnect())) {
          return false;
        }
      }
      const cdAuditUserIds = ds.cdAuditUserIds.map((x) => (typeof x === 'object' ? x.id : x));
      const data = {
        ...ds,
        cdAuditUserIds,
        triggerValue:
          typeof ds.triggerValue === 'object'
            ? ds.triggerValue?.join(',')
            : ds.triggerValue,
      };
      if (ds.type !== 'cdAudit') {
        data.metadata = getMetadata(ds);
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
      let extra = {};
      if (jobDetail.type === 'cdDeploy') {
        const { value } = JSON.parse(jobDetail.metadata.replace(/'/g, '"'));
        value && setValueIdValues(Base64.decode(value));
      } else if (jobDetail.type === addCDTaskDataSetMap.apiTest) {
        if (jobDetail.metadata) {
          const metadata = JSONbig.parse(jobDetail.metadata.replace(/'/g, '"'));
          extra[addCDTaskDataSetMap.relativeMission] = metadata[
            addCDTaskDataSetMap.relativeMission];
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
        }
      } else if (jobDetail.type === 'cdHost') {
        const metadata = JSONbig.parse(jobDetail.metadata.replace(/'/g, '"'));
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
        } else if (hostDeployType === 'jar') {
          setJarValues(Base64.decode(metadata.jarDeploy.value));
        }
      } else if (jobDetail.type === 'cdAudit') {
        if (jobDetail.metadata) {
          const { cdAuditUserIds } = JSON.parse(
            jobDetail.metadata.replace(/'/g, '"'),
          );
          newCdAuditUserIds = cdAuditUserIds && [...cdAuditUserIds];
        }
      }

      const newJobDetail = {
        ...jobDetail,
        ...extra,
        ...(jobDetail.metadata ? JSONbig.parse(jobDetail.metadata.replace(/'/g, '"')) : {}),
        cdAuditUserIds: newCdAuditUserIds && [...newCdAuditUserIds],
        triggerValue:
          jobDetail.triggerType === 'regex'
            ? jobDetail.triggerValue
            : jobDetail.triggerValue?.split(','),
      };
      delete newJobDetail.metadata;
      ADDCDTaskDataSet.loadData([newJobDetail]);
    }
    ADDCDTaskDataSet.current.set(
      'glyyfw',
      appServiceId
        || PipelineCreateFormDataSet.getField('appServiceId').getText(
          PipelineCreateFormDataSet.current.get('appServiceId'),
        ),
    );
    handleClickMore();
  }, [ADDCDTaskDataSet, PipelineCreateFormDataSet, appServiceId, jobDetail]);

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

  const handleTestConnect = async () => new Promise((resolve) => {
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
        ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.hostSource)
        === addCDTaskDataSetMap.alreadyhost
          ? `/devops/v1/projects/${projectId}/hosts/connection_test_by_id?host_id=${host}`
          : `/devops/v1/projects/${projectId}/cicd_pipelines/test_connection`,
        {
          hostIp,
          hostPort,
          username,
          password: authType === 'accountPassword' ? password : (accountKeyValue && Base64.encode(accountKeyValue)),
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

  // const renderRelatedJobOpts = () => {
  //   const currentHostDeployType = ADDCDTaskDataSet?.current?.get(
  //     'hostDeployType'
  //   );
  //   const tempArr = pipelineStageMainSource
  //     && pipelineStageMainSource.length > 0
  //     && pipelineStageMainSource.map((item) => item?.jobList.slice());
  //   const jobArr = tempArr
  //     ? tempArr.length > 0 && [].concat.apply(...tempArr)
  //     : [];
  //   let filterArr;
  //   if (jobArr && currentHostDeployType && currentHostDeployType === 'image') {
  //     filterArr = jobArr.filter(
  //       (x) => x.configJobTypes?.includes('docker') && x.type === 'build',
  //     );
  //   } else if (currentHostDeployType === 'jar') {
  //     filterArr = jobArr.filter(
  //       (x) => (x.configJobTypes?.includes('maven_deploy')
  //           || x.configJobTypes?.includes('upload_jar'))
  //         && x.type === 'build',
  //     );
  //   }
  //   if (filterArr && filterArr.length > 0) {
  //     if (typeof filterArr[0] === 'object') {
  //       ADDCDTaskDataSet.current.set('pipelineTask', filterArr[0].name);
  //     }
  //   }
  //   return (
  //     filterArr
  //     && filterArr.length > 0
  //     && filterArr.map((item) => <Option value={item.name}>{item.name}</Option>)
  //   );
  // };

  function searchMatcher({ record, text }) {
    return record.get('pipelineTask')?.indexOf(text) !== -1;
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
      children: <DeployConfig
        envId={ADDCDTaskDataSet.current.get('envId')}
        appServiceId={PipelineCreateFormDataSet.current.get('appServiceId')}
        appServiceName={appServiceId}
        refresh={({ valueId, value }) => {
          ADDCDTaskUseStore.setValueIdRandom(Math.random());
          ADDCDTaskDataSet.current.set('valueId', valueId);
          // const origin = ADDCDTaskUseStore.getValueIdList;
          setValueIdValues(value);
        }}
      />,
      title: '创建部署配置',
    });
  };

  const rendererValueId = ({ value, text, record }) => (text === '创建部署配置' ? (
    <a
      style={{
        width: 'calc(100% + 0.24rem)', display: 'inline-block', position: 'relative', right: '0.12rem',
      }}
      role="none"
      onClick={(e) => handleClickCreateValue(e)}
    >
      <span style={{ marginLeft: '0.12rem' }}>
        {text}
      </span>
    </a>
  ) : text);

  const optionRenderValueId = ({ value, text, record }) => rendererValueId({ text });

  const renderHostSetting = () => {
    const value = ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.hostSource);
    if (value === addCDTaskDataSetMap.alreadyhost) {
      return [
        <div
          colSpan={2}
          style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative',
          }}
          newLine
        >
          <Select
            style={{ flex: 1 }}
            name={addCDTaskDataSetMap.host}
            onChange={(value2) => {
              const item = ADDCDTaskUseStore.getHostList.find((i) => i.id == value2);
              ADDCDTaskDataSet.current.set('hostIp', item.hostIp);
              ADDCDTaskDataSet.current.set('hostPort', item.sshPort);
            }}
          />
          <div style={{ flex: 1, marginLeft: 16 }}>
            <TextField style={{ width: '100%' }} name="hostIp" />
          </div>
          <div style={{ flex: 1, marginLeft: 16 }}>
            <TextField style={{ width: '100%' }} name="hostPort" />
          </div>
        </div>,
      ];
    }
    return [
      <TextField newLine colSpan={1} name="hostIp" />,
      <TextField colSpan={1} name="hostPort" />,
      <SelectBox colSpan={1} name="authType" className="addcdTask-mode">
        <Option value="accountPassword">用户名与密码</Option>
        <Option value="accountKey">用户名与密钥</Option>
      </SelectBox>,
      <TextField colSpan={1} newLine name="username" />,
        ADDCDTaskDataSet?.current?.get('authType')
        === 'accountPassword' ? (
          <Password colSpan={1} name="password" />
          ) : (
            [
              <p newLine colSpan={1} className="addcdTask-accountKeyP">
                密钥
              </p>,
              <YamlEditor
                colSpan={2}
                newLine
                readOnly={false}
                value={accountKeyValue}
                modeChange={false}
                onValueChange={(data) => setAccountKeyValue(data)}
              />,
            ]
          ),
    ];
  };

  /**
   * 修改配置信息事件
   */
  const handleChangeValueIdValues = () => {
    let tempValues = valueIdValues;
    Modal.open({
      key: Modal.key(),
      title: '修改部署配置""的配置信息',
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
          ...ADDCDTaskUseStore.getValueIdList.find((i) => String(i.id) === String(ADDCDTaskDataSet.current.get('valueId'))),
          value: tempValues,
        });
        ADDCDTaskUseStore.setValueIdRandom(Math.random());
        setValueIdValues(tempValues);
      },
      onCancel: () => {
      },
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
                <Tips helpText="此处的关联构建任务，仅会查询出该条流水线中存在'Docker构建'步骤的“构建类型”任务。若所选任务中存在多个“Docker构建”步骤，则只会部署第一个“Docker构建”步骤产生的镜像" />
              }
              searchMatcher={searchMatcher}
            >
              {relatedJobOpts.map((item) => <Option value={item.name}>{item.name}</Option>)}
            </Select>
          ),
          currentDepoySource === 'matchDeploy' && (
            <Select colSpan={3} name="repoId" />
          ),
          currentDepoySource === 'matchDeploy' && (
            <Select colSpan={3} name="imageId" />
          ),
          currentDepoySource === 'matchDeploy' && (
            <Select colSpan={3} name="matchType">
              <Option value="refs">模糊匹配</Option>
              <Option value="regex">正则匹配</Option>
              <Option value="exact_match">精确匹配</Option>
              <Option value="exact_exclude">精确排除</Option>
            </Select>
          ),
          currentDepoySource === 'matchDeploy' && (
            <TextField colSpan={3} name="matchContent" />
          ),
          <TextField colSpan={3} name="containerName" />,
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
          <Select
            newLine
            colSpan={3}
            name="deploySource"
            clearButton={false}
            addonAfter={
              <Tips helpText="流水线制品部署表示直接使用所选关联构建任务中生成的jar包进行部署；匹配制品部署则表示可自主选择项目下制品库中的jar包，并需配置jar包版本的正则匹配规则，后续部署的jar包版本便会遵循此规则。" />
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
                <Tips helpText="此处的关联构建任务，仅会查询出该条流水线中存在'上传jar包至制品库'或“Maven发布”步骤的“构建类型”任务。若所选任务中存在多个满足条件的步骤，则只会部署所选任务中第一个满足条件的步骤产生的jar包；" />
              }
              searchMatcher={searchMatcher}
            >
              {relatedJobOpts.map((item) => <Option value={item.name}>{item.name}</Option>)}
            </Select>
          ),
          currentDepoySource === 'matchDeploy' && (
            <Select colSpan={3} name="serverName" />
          ),
          currentDepoySource === 'matchDeploy' && (
            <Select colSpan={3} name="repositoryId" />
          ),
          currentDepoySource === 'matchDeploy' && (
            <Select colSpan={3} name="groupId" />
          ),
          currentDepoySource === 'matchDeploy' && (
            <Select colSpan={3} name="artifactId" />
          ),
          currentDepoySource === 'matchDeploy' && (
            <TextField
              colSpan={6}
              name="versionRegular"
              addonAfter={(
                <Tips
                  helpText="正则表达式匹配版本名，默认值^*master*$，参考demo如下：^*master*$:模糊匹配版本名包含master，^hotfix-0.21.1$：精确匹配版本名为hotfix-0.21.1"
                />
              )}
            />
          ),
          <TextField
            addonAfter={(
              <Tips
                helpText={(
                  <>
                    <p style={{ margin: 0 }}>
                      默认工作目录，当前工作目录(./)，jar包下载存放目录为：./temp-jar/xxx.jar 日志存放目录为：./temp-log/xxx.log
                    </p>
                    <p style={{ margin: 0 }}>
                      填写工作目录，jar包下载存放目录为：工作目录/temp-jar/xxx.jar 日志存放目录为：工作目录/temp-jar/xxx.log
                    </p>
                  </>
                )}
              />
            )}
            colSpan={3}
            name="workingPath"
          />,
          <YamlEditor
            colSpan={6}
            newLine
            className="addcdTask-yamleditor"
            readOnly={false}
            value={jarValues}
            onValueChange={(data) => setJarValues(data)}
          />,
        ],
      };
      return result[ADDCDTaskDataSet?.current?.get('hostDeployType')];
    }
    const obj = {
      cdDeploy: [
        <div className="addcdTask-divided" />,
        <p className="addcdTask-title">配置信息</p>,
        <Form
          className="addcdTask-form2"
          columns={3}
          dataSet={ADDCDTaskDataSet}
        >
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
      cdHost: [
        <div className="addcdTask-divided" />,
        <p className="addcdTask-title">主机设置</p>,
        <Form
          className="addcdTask-cdHost"
          columns={2}
          dataSet={ADDCDTaskDataSet}
        >
          <SelectBox
            style={{ top: '16px' }}
            colSpan={1}
            name={addCDTaskDataSetMap.hostSource}
            onChange={() => {
              ADDCDTaskDataSet.current.set(addCDTaskDataSetMap.host, undefined);
              ADDCDTaskDataSet.current.set('hostIp', undefined);
              ADDCDTaskDataSet.current.set('hostPort', undefined);
            }}
          >
            <Option value={addCDTaskDataSetMap.alreadyhost}>已有主机</Option>
            <Option value={addCDTaskDataSetMap.customhost}>自定义主机</Option>
          </SelectBox>
          {renderHostSetting()}
          <div newLine colSpan={2} style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              disabled={
                ADDCDTaskDataSet.current.get(
                  addCDTaskDataSetMap.hostSource,
                ) === addCDTaskDataSetMap.customhost
                  ? (!ADDCDTaskDataSet.current.get('hostIp')
                || !ADDCDTaskDataSet.current.get('hostPort')
                || !ADDCDTaskDataSet.current.get('username')) : !ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.host)
              }
              onClick={handleTestConnect}
              style={{ marginRight: 20 }}
              color="primary"
              funcType="raised"
            >
              测试连接
            </Button>
            {getTestDom()}
          </div>
        </Form>,
        <div className="addcdTask-divided" />,
        <p className="addcdTask-title">主机部署</p>,
        <Form style={{ marginTop: 20 }} columns={6} dataSet={ADDCDTaskDataSet}>
          <SelectBox
            className="addcdTask-mainMode"
            colSpan={5}
            name="hostDeployType"
            onChange={(data) => {
              ADDCDTaskDataSet.current.set('hostDeployType', data);
              if (data !== 'customize') {
                ADDCDTaskDataSet.current.set('deploySource', 'pipelineDeploy');
                // console.log(ADDCDTaskDataSet.getField('pipelineTask'));
                // ADDCDTaskDataSet.current.set('pipelineTask', '123');
              }
            }}
          >
            <Option value="image">镜像部署</Option>
            <Option value="jar">jar包部署</Option>
            <Option value="customize">自定义命令</Option>
          </SelectBox>
          ,
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
          {
            ADDCDTaskDataSet.current.get(addCDTaskDataSetMap.alarm) && [
              <TextField
                name={addCDTaskDataSetMap.threshold}
                newLine
                suffix="%"
                restrict="0-9|."
                min={0}
                max={100}
                addonAfter={(
                  <Tips
                    helpText="即指定一个执行成功率的标准值，若后续在流水线中执行该API测试任务后成功率低于设定值，便会告警通知到指定人员。仅能填入0-100。"
                  />
                )}
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
                addonAfter={(
                  <Tips helpText="可选择项目下任意人员作为通知对象。" />
                )}
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
                <Tooltip title={(
                  <>
                    <p>若选择为是，则表示API测试任务执行成功率低于设定值后，后续的阶段与任务将被阻塞，不会执行。</p>
                    <p>若选择为否，则表示无论执行成功率如何，此任务执行完成后，均会继续执行接下来的阶段或任务。</p>
                  </>
                )}
                >
                  <Icon
                    style={{
                      position: 'absolute',
                      top: '-18px',
                      right: '70px',
                      color: 'rgba(0, 0, 0, 0.36)',
                    }}
                    type="help"
                  />
                </Tooltip>
              </div>,
            ]
          }
        </Form>,
      ],
    };
    return obj[ADDCDTaskDataSet?.current?.get('type')];
  };

  async function handleClickMore(e, realName) {
    if (!ADDCDTaskDataSet.current.get('pageSize')) {
      ADDCDTaskDataSet.current.set('pageSize', 20);
    }
    e && e.stopPropagation();
    const pageSize = !e
      ? ADDCDTaskDataSet.current.get('pageSize')
      : ADDCDTaskDataSet.current.get('pageSize') + 20;
    const url = `/devops/v1/projects/${projectId}/users/app_services/${PipelineCreateFormDataSet.current.get('appServiceId')}?page=0&size=${pageSize}`;
    const cdAuditsUserIds = [];
    jobDetail?.cdAuditUserIds
      && jobDetail.cdAuditUserIds.forEach((obj) => {
        if (typeof obj === 'string') {
          cdAuditsUserIds.push(obj);
        } else if (typeof obj === 'object') {
          cdAuditsUserIds.push(obj?.id);
        }
      });
    const res = await axios.post(url, {
      userName: realName || '',
      ids: cdAuditsUserIds || [],
    });
    if (res.content.length % 20 === 0 && res.content.length !== 0) {
      res.content.push({
        realName: '加载更多',
        id: 'more',
      });
    }
    ADDCDTaskDataSet.current.set('pageSize', pageSize);
    if (realName) {
      ADDCDTaskDataSet.getField('cdAuditUserIds').props.lookup = [
        ...res.content,
        ...ADDCDTaskDataSet.getField('cdAuditUserIds').props.lookup,
      ];
    } else {
      ADDCDTaskDataSet.getField('cdAuditUserIds').props.lookup = res.content;
    }
  }

  const renderderAuditUsersList = ({ text, record }) => {
    const ldap = record.get('ldap');
    if (text === '加载更多') {
      return (
        <a
          style={{ display: 'block', width: '100%', height: '100%' }}
          onClick={handleClickMore}
          role="none"
        >
          {text}
        </a>
      );
    }
    return ldap ? `${text}(${record.get('loginName')})` : `${text}(${record.get('email')})`;
  };

  /**
   * 外部卡点回调地址的复制事件
   */
  const handleCopy = () => {
    Choerodon.prompt('复制成功');
  };

  const getBranchsList = useCallback(async () => {
    const url = `devops/v1/projects/${projectId}/app_service/${PipelineCreateFormDataSet.current.get(
      'appServiceId',
    )}/git/page_branch_by_options?page=1&size=${currentSize}`;
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
  }, [PipelineCreateFormDataSet, projectId]);

  const renderderBranchs = ({ text }) => (text === '加载更多' ? (
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
  ));

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
            backgroundColor: record.get('connected')
              ? 'rgb(0, 191, 165)'
              : '#ff9915',
          }}
        />
      )}
      {text}
    </span>
  );

  const optionRenderer = ({ record, text, value }) => (
    <Tooltip title={!record.get('connected') && '未连接'}>
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
        if ((iIndex < columnIndex - 1)) {
          lists = [...lists, ...i.jobList];
        } else {
          //  如果遍历列是当切列
          lists = [...lists, ...i.jobList.splice(0, witchColumnJobIndex - 1)];
        }
      }
    });
    // 返回任务是部署任务的options
    return lists.filter((l) => l.type === 'cdDeploy').map((i) => <Option value={i.name}>{i.name}</Option>);
  };

  return (
    <div className="addcdTask">
      <Form columns={3} dataSet={ADDCDTaskDataSet}>
        <Select
          onChange={(data) => {
            const newData = {
              type: data,
              glyyfw:
                appServiceId
                || PipelineCreateFormDataSet.getField('appServiceId').getText(
                  PipelineCreateFormDataSet.current.get('appServiceId'),
                ),
              triggerType: 'refs',
              deployType: 'create',
              authType: 'accountPassword',
              hostDeployType: 'image',
              deploySource: 'pipelineDeploy',
              [addCDTaskDataSetMap.hostSource]: addCDTaskDataSetMap.alreadyhost,
              workingPath: './',
              name: ADDCDTaskDataSet.current.get('name') || undefined,
            };
            if (data === 'cdHost' && relatedJobOpts
              && relatedJobOpts.length === 1) {
              newData.pipelineTask = relatedJobOpts[0].name;
            }
            ADDCDTaskDataSet.loadData([newData]);
          }}
          colSpan={1}
          name="type"
        >
          <Option value="cdDeploy">部署</Option>
          <Option value="cdHost">主机部署</Option>
          <Option value="cdAudit">人工卡点</Option>
          <Option value={addCDTaskDataSetMap.apiTest}>API测试</Option>
          <Option value={addCDTaskDataSetMap.externalStuck}>外部卡点</Option>
        </Select>
        <TextField colSpan={2} name="name" />
        <TextField colSpan={1} name="glyyfw" />
        <div className="addcdTask-wrap" colSpan={2}>
          <Select
            name="triggerType"
            className="addcdTask-triggerType"
            onChange={() => ADDCDTaskDataSet.current.set('triggerValue', undefined)}
            colSpan={1}
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
                <Tips helpText="您可在此输入正则表达式来配置触发分支；例：若想匹配以 feature 开头的分支，可以输入 ^feature.*。更多表达式，详见用户手册。若不填写，则默认为所有分支和tag" />
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
              maxTagCount={4}
              maxTagPlaceholder={(omittedValues) => (
                <Tooltip title={omittedValues.join(',')}>
                  {`+${omittedValues.length}`}
                </Tooltip>
              )}
              renderer={renderderBranchs}
              colSpan={2}
            >
              {branchsList?.map((b) => (
                <Option value={b.value}>{b.name}</Option>
              ))}
            </Select>
          )}
        </div>
        {
          ADDCDTaskDataSet.current.get('type') === addCDTaskDataSetMap.apiTest && [
            <Select
              newLine
              colSpan={1}
              name={addCDTaskDataSetMap.apiTestMission}
              addonAfter={<Tips helpText="此处仅能从项目下已有的API测试任务中进行选择" />}
            />,
            <Select
              colSpan={2}
              name={addCDTaskDataSetMap.relativeMission}
              addonAfter={(
                <Tips
                  helpText={(
                    <>
                      <p>
                        1. 此处为非必选，若不选关联部署任务，则代表，API测试任务在执行前不会做任何判断
                      </p>
                      <p>
                        2. 此处仅支持选择该任务之前的任一部署任务；
                        选择后，在执行此API测试任务前便会校验：关联的部署任务中对应的新版本是否已部署成功。只有该版本对应的pod状态为可用时，测试任务才会执行
                      </p>
                    </>
                  )}
                />
              )}
            >
              {renderRelatedMission()}
            </Select>,
          ]
        }
        {ADDCDTaskDataSet?.current?.get('type') === 'cdDeploy' && [
          <Select
            colSpan={1}
            name="envId"
            optionRenderer={optionRenderer}
            // renderer={renderer}
            onOption={({ record }) => ({
              disabled: !record.get('connected'),
            })}
          />,
          isProjectOwner && (
            <div
              className="addcdTask-whetherBlock addcdTask-triggersTasks"
              style={{
                position: 'relative',
                top: '12px',
              }}
              colSpan={2}
            >
              <SelectBox
                name={addCDTaskDataSetMap.triggersTasks.name}
              >
                <Option value={addCDTaskDataSetMap.triggersTasks.values[0]}>是</Option>
                <Option value={addCDTaskDataSetMap.triggersTasks.values[1]}>否</Option>
              </SelectBox>
              <Tooltip title="此处仅项目所有者可以设置；默认为是，即触发用户在没有该部署任务的环境权限时，将会直接使用管理员账户触发部署；若选择为否，触发成员在没有环境权限时，将会直接跳过此部署任务。">
                <Icon
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '195px',
                    color: 'rgba(0, 0, 0, 0.36)',
                  }}
                  type="help"
                />
              </Tooltip>
            </div>
          ),
          <SelectBox
            className="addcdTask-mode"
            newLine
            colSpan={1}
            name="deployType"
          >
            <Option value="create">新建实例</Option>
            <Option value="update">替换实例</Option>
          </SelectBox>,
          <p className="addcdTask-text" colSpan={2}>
            <Icon style={{ color: '#F44336', position: 'relative', bottom: '2px' }} type="error" />
            替换实例会更新该实例的镜像及配置信息，请确认要替换的实例选择无误。
          </p>,
          ADDCDTaskDataSet?.current?.get('deployType') === 'create' ? (
            <TextField newLine colSpan={2} name="instanceName" />
          ) : (
            <Select newLine colSpan={2} name="instanceId" />
          ),
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
                searchMatcher="realName"
                onOption={({ record }) => ({
                  disabled: record.get('id') === 'more',
                })}
                onChange={() => {
                  handleClickMore(null);
                }}
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
                      <Tooltip title={isLdap ? `${value.realName}(${value.loginName})` : `${value.realName}(${value.email})`}>
                        {value.realName}
                      </Tooltip>
                    );
                  }
                  return (
                    <Tooltip title={text}>
                      {text}
                    </Tooltip>
                  );
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
        {
          ADDCDTaskDataSet.current.get('type') === addCDTaskDataSetMap.externalStuck && [
            <div colSpan={3} className="addcdTask-missionDes">
              <span style={{ fontWeight: 500 }}>任务说明：</span>
              <span style={{ display: 'inline-block' }}>
                - 外部卡点任务用于对接Choerodon平台外的工作流或系统。此任务触发时，
                会默认将projectId、pipelineRecordId、stageRecordId 、jobRecordId、callback_token、
                currentCdJob以及pipelineRecordDetails发送至外部地址。
              </span>
              <span style={{ display: 'inline-block' }}>
                - 外部系统执行结束后，会往
                {' '}
                <span className="addcdTask-missionDes-focus">流水线回调地址</span>
                {' '}
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
              <span style={{ display: 'block' }}>- approval_status： 任务执行状态（true/false ,代表外部卡点任务执行成功或失败）</span>
            </div>,
            <TextField
              label="流水线回调地址"
              colSpan={3}
              addonAfter={(
                <CopyToClipboard
                  text={pipelineCallbackAddress}
                  onCopy={handleCopy}
                >
                  <Icon style={{ cursor: 'pointer' }} type="content_copy" />
                </CopyToClipboard>
              )}
              disabled
              required
              value={pipelineCallbackAddress}
            />,
            <TextArea
              name={addCDTaskDataSetMap.externalAddress}
              colSpan={3}
            />,
            <TextArea
              name={addCDTaskDataSetMap.externalToken}
              colSpan={3}
            />,
            <TextArea
              name={addCDTaskDataSetMap.missionDes}
              colSpan={3}
            />,
          ]
        }
      </Form>
      {getOtherConfig()}
    </div>
  );
});
