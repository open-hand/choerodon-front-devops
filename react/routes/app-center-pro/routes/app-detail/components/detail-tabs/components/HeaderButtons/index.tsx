/* eslint-disable max-len */
import React, { useMemo } from 'react';
import {
  HeaderButtons,
  devopsHostsApi,
  CONSTANTS,
  devopsDockerComposeApi,
} from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { Tooltip, Modal } from 'choerodon-ui/pro';
import { useAppDetailTabsStore } from '../../stores';
import { openModifyValueModal } from '@/components/modify-values';
import { useAppDetailsStore } from '../../../../stores';
import { openNetWorkFormModal } from '@/components/create-network';
import { openDomainFormModal } from '@/components/domain-form';
import { openRedeploy } from '@/components/reDeploy';
import { openMarketUpgradeModal } from '@/components/app-upgrade';
import { openHzeroUpgradeModal } from '@/components/app-upgrade-hzero';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import {
  APP_STATUS,
  CHART_CATERGORY,
  DEPLOY_CATERGORY,
  ENV_TAB,
  HOST_CATERGORY,
  IS_HOST,
  IS_MARKET,
  IS_SERVICE,
  MIDDLWARE_CATERGORY,
  OTHER_CATERGORY,
  DOCKER_CATEGORY,
  DOCKER_COMPOSE_CATEGORY,
} from '@/routes/app-center-pro/stores/CONST';
import {
  DOCKER_TYPE,
} from '@/routes/app-center-pro/routes/app-detail/CONSTANT';
import HostDockerCompose from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-docker-compose';
import { getAppCategories, getChartSourceGroup } from '@/routes/app-center-pro/utils';
import AppCenterProServices from '@/routes/app-center-pro/services';
import {
  openAppConfigModal,
  openContainerConfigModal,
  openDeployGroupConfigModal,
  openHostAppConfigModal,
  openHostDockerConfigModal,
} from '@/components/appCenter-editModal';
import openDeleteHostAppModal from '@/components/app-deletion-host';
import {
  HOST_CONNECTED,
  HOST_DISCONNECTED,
} from '@/routes/app-center-pro/routes/app-detail/components/detail-tabs/components/HeaderButtons/CONSTANTS';

const {
  MODAL_WIDTH: {
    MAX,
  },
} = CONSTANTS;

const DetailsTabsHeaderButtons = () => {
  const {
    goBackHomeBaby,
    deleteEnvApp,
    formatMessage,
  } = useAppCenterProStore();

  const {
    refresh,
    projectId,
  } = useAppDetailTabsStore();

  const {
    appDs,
    deployTypeId: hostOrEnvId,
    deployType,
    appCatergory,
    rdupmType,
    appId,
    enableAppMonitor,
    disableAppMonitor,
  } = useAppDetailsStore();

  const appRecord = appDs.current;
  const {
    appServiceVersionId,
    appServiceName,
    appServiceId,
    hostId,
    instanceId,
    chartSource,
    commandVersion,
    name,
    id,
    code,
    objectStatus: appStatus,
    devopsHostCommandDTO = {},
    sourceType,
    instanceName,
    objectName,
    metricDeployStatus,
    upgradeAvailable,
    currentVersionAvailable,
    rdupmType: appRdupmType,
    // 环境相关
    envConnected,
  } = appRecord?.toData() || {};

  const isEnv = deployType === ENV_TAB;

  const isHzero = chartSource === 'hzero';

  const isMarket = chartSource === 'market' || isHzero;

  const isMiddleware = chartSource === 'middleware';

  // 是market的chartSource或者middleWare的情况下去走currentVersionAvailable逻辑
  const isMarketAppDisabled = (isMarket || isMiddleware) && !currentVersionAvailable;

  const envNotConnected = !envConnected;

  const btnDisabledEnv = envNotConnected || !appStatus || !([APP_STATUS.FAILED, APP_STATUS.RUNNING, APP_STATUS.STOP].includes(appStatus));

  const btnDisabledHost = false;

  const whichGroup = getChartSourceGroup(
    chartSource || sourceType, deployType,
  );

  // 修改应用（3种分类）
  const modifyAppObj = useMemo(() => {
    let obj;
    switch (appCatergory.code) {
      case CHART_CATERGORY:
        obj = {
          name: '修改应用',
          icon: 'add_comment-o',
          tooltipsConfig: getUnconnectTooltipsConfig(btnDisabledEnv),
          disabled: btnDisabledEnv,
          handler: () => {
            openAppConfigModal(appRecord?.toData() || {}, refresh);
          },
          permissions: ['choerodon.code.project.deploy.app-deployment.application-center.updateChart'],
        };
        break;
      case DEPLOY_CATERGORY:
        obj = {
          name: '修改应用',
          groupBtnItems: [
            {
              name: '修改应用配置',
              tooltipsConfig: getUnconnectTooltipsConfig(btnDisabledEnv),
              disabled: btnDisabledEnv,
              handler: () => openDeployGroupConfigModal(appRecord?.toData(), refresh),
              permissions: ['choerodon.code.project.deploy.app-deployment.application-center.updateDeployGroupApp'],
            },
            {
              disabled: btnDisabledEnv,
              name: '修改容器配置',
              handler: () => openContainerConfigModal(appRecord?.toData(), refresh),
              permissions: ['choerodon.code.project.deploy.app-deployment.application-center.updateDeployGroupContainer'],
            },
          ],
        };
        break;
      case HOST_CATERGORY:
      case OTHER_CATERGORY:
      case MIDDLWARE_CATERGORY:
        obj = {
          name: '修改应用',
          handler: () => {
            openHostAppConfigModal(appRecord?.toData() || {}, () => appDs.query());
            // const data = appRecord?.toData();
            // if (['jar', 'other'].includes(data?.rdupmType)) {
            //   const killCommandExist = data?.killCommandExist;
            //   if (!killCommandExist) {
            //     Modal.confirm({
            //       title: '未维护删除操作',
            //       children: '此应用当前暂未维护【删除操作】，无法执行修改操作。',
            //       okText: '我知道了',
            //       okCancel: false,
            //     });
            //   } else {
            //   }
            // }
          },
          tooltipsConfig: getUnconnectTooltipsConfig(btnDisabledHost),
          disabled: btnDisabledHost,
          permissions: ['choerodon.code.project.deploy.app-deployment.application-center.updateHost'],
          icon: 'add_comment-o',
        };
        break;
      case DOCKER_CATEGORY: {
        obj = {
          name: '修改应用',
          handler: () => {
            openHostDockerConfigModal(appRecord?.toData() || {}, () => appDs.query());
          },
          tooltipsConfig: getUnconnectTooltipsConfig(btnDisabledHost),
          disabled: btnDisabledHost,
          permissions: ['choerodon.code.project.deploy.app-deployment.application-center.updateHost'],
          icon: 'add_comment-o',
        };
        break;
      }
      case DOCKER_COMPOSE_CATEGORY: {
        obj = {
          name: '修改应用',
          handler: () => {
            Modal.open({
              title: '修改应用',
              key: Modal.key(),
              children: (
                <HostDockerCompose
                  data={appRecord?.toData()}
                  refresh={() => appDs.query()}
                />
              ),
              drawer: true,
              okText: '保存',
              style: {
                width: MAX,
              },
            });
          },
          disabled: false,
          permissions: ['choerodon.code.project.deploy.app-deployment.application-center.editDockerCompose'],
          icon: 'add_comment-o',
        };
      }
      default:
        break;
    }
    return obj;
  }, [appCatergory.code, appRecord, refresh]);

  // 创建资源
  const createSource = useMemo(() => (
    {
      name: '创建资源',
      icon: 'playlist_add',
      groupBtnItems: [
        {
          name: '创建网络',
          disabled: btnDisabledEnv,
          handler: () => {
            openNetWorkFormModal({
              envId: hostOrEnvId, appServiceId, refresh, name, code,
            });
          },
        },
        {
          name: appRecord?.get('existService') ? '创建域名' : <Tooltip title="请先创建一个该应用关联的网络">创建域名</Tooltip>,
          disabled: btnDisabledEnv || !appRecord?.get('existService'),
          handler: () => {
            openDomainFormModal({
              envId: hostOrEnvId,
              appServiceId,
              refresh,
            });
          },
        },
      ],
    }
  ), [appServiceId, hostOrEnvId, refresh]);

  function getUnconnectTooltipsConfig(enabled: boolean) {
    return (enabled ? ({
      title: '环境处于未连接状态，无法操作',
    }) : undefined);
  }

  // 修改values
  const modifyValues = {
    name: '修改Values',
    icon: 'rate_review1',
    tooltipsConfig: getUnconnectTooltipsConfig(isMarketAppDisabled || btnDisabledEnv),
    disabled: isMarketAppDisabled || btnDisabledEnv,
    disabledMessage: !btnDisabledEnv ? formatMessage({ id: 'c7ncd.deployment.instance.disable.message' }) : null,
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-values-modify'],
    handler: () => openModifyValueModal({
      appServiceVersionId,
      appServiceId,
      instanceId,
      isMarket,
      isMiddleware,
      envId: hostOrEnvId,
      afterDeploy: refresh,
    }),
  };

  const getRedeployTitle = (envDisabled: boolean, marketDisabled: boolean) => {
    if (envDisabled) {
      return '环境处于未连接状态，无法操作';
    } if (marketDisabled) {
      return formatMessage({ id: 'c7ncd.deployment.instance.disable.message' });
    }
    return '';
  };

  // 重新部署
  const redeploy = {
    name: '重新部署',
    icon: 'redeploy_line',
    disabled: btnDisabledEnv || isMarketAppDisabled,
    tooltipsConfig: {
      title: getRedeployTitle(btnDisabledEnv, isMarketAppDisabled),
    },
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-redeploy'],
    handler: () => openRedeploy({
      appServiceId: instanceId,
      commandVersion,
      projectId,
      refresh,
    }),
  };

  // 启用应用
  const activeApp = {
    name: '启用应用',
    disabled: isEnv && btnDisabledEnv,
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    handler: () => AppCenterProServices.toggleActive({
      active: 'start',
      name,
      refresh,
      projectId,
      envId: hostOrEnvId,
      instanceId,
      appCatergoryCode: appCatergory.code,
    }),
  };

  // 停用应用
  const stopApp = {
    name: '停用应用',
    disabled: isEnv && btnDisabledEnv,
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    handler: () => AppCenterProServices.toggleActive({
      active: 'stop',
      name,
      refresh,
      projectId,
      envId: hostOrEnvId,
      instanceId,
      appCatergoryCode: appCatergory.code,
      hostId,
    }),
  };

  const reDeploy = {
    name: '重新部署',
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.redeployDockerCompose'],
    handler: async () => {
      Modal.open({
        key: Modal.key(),
        title: '确认',
        children: '是否重新部署?',
        onOk: async () => {
          try {
            await devopsDockerComposeApi.restartDockerCompose(appRecord?.toData()?.id);
            appDs?.query();
          } catch (e) {
            console.log(e);
          }
        },
      });
    },
  };

  const restartApp = {
    name: '重启应用',
    permissions: [],
    handler: async () => {
      try {
        await devopsHostsApi.restartApp(hostId, instanceId);
        appDs.query();
      } catch (e) {
        console.log(e);
      }
    },
  };
  const disableMonitor = {
    name: '停用应用监控',
    permissions: [],
    disabled: !envConnected,
    tooltipsConfig: {
      placement: 'bottom',
      title: !envConnected ? '环境状态未连接，无法执行此操作。' : '',
    },
    handler: async () => {
      try {
        Modal.open({
          title: '停用应用监控',
          key: Modal.key(),
          children:
  <div>
    确定要停用应用
    {name}
    的监控吗？
    <br />
    停用后，应用的异常与停机数据将不再收集；
    <br />
    已经收集的，近6个月内的监控数据不会清除，后续开启后可继续查看
  </div>,
          okText: '停用',
          onOk: disableAppMonitor,
        });
      } catch (e) {
        console.log(e);
      }
    },
  };

  const enableMonitor = {
    name: '开启应用监控',
    permissions: [],
    disabled: !envConnected,
    tooltipsConfig: {
      placement: 'bottom',
      title: !envConnected ? '环境状态未连接，无法执行此操作。' : '',
    },
    handler: async () => {
      try {
        enableAppMonitor();
      } catch (e) {
        console.log(e);
      }
    },
  };

  // 删除应用
  const deleteApp = {
    name: '删除应用',
    disabled: isEnv && btnDisabledEnv,
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-delete'],
    handler: () => {
      deployType === ENV_TAB ? deleteEnvApp({
        appCatergoryCode: getAppCategories(rdupmType, deployType).code,
        envId: hostOrEnvId,
        instanceId,
        instanceName: name,
        appId,
        callback: goBackHomeBaby,
      }) : openDeleteHostAppModal(hostOrEnvId, appId, name, goBackHomeBaby, appRecord);
    },
  };

  // 升级
  const upGrade = {
    name: '升级',
    icon: 'rate_review1',
    display: isMarket && !isMiddleware,
    disabled: btnDisabledEnv || isMarketAppDisabled || !upgradeAvailable,
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-upgrade'],
    tooltipsConfig: {
      placement: 'bottom',
      title: !btnDisabledEnv && (isMarketAppDisabled || !upgradeAvailable) ? formatMessage({ id: `c7ncd.deployment.instance.disable.message${currentVersionAvailable ? '.upgrade' : ''}` }) : '',
    },
    handler: () => {
      const openModalHandle = isHzero ? openHzeroUpgradeModal : openMarketUpgradeModal;
      openModalHandle({
        instanceId,
        appServiceId,
        appServiceName,
        envId: hostOrEnvId,
        appServiceVersionId,
        callback: refresh,
        isMiddleware,
        isHzero,
      });
    },
  };

  // 更多操作
  const moreOpts = (() => {
    let btnsGroup: any[] = [];

    const currentStatus = deployType === ENV_TAB ? appStatus : devopsHostCommandDTO?.status;
    switch (currentStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        btnsGroup = [stopApp];
        break;
      case APP_STATUS.STOP:
        btnsGroup = [activeApp];
        break;
      case APP_STATUS.SUCCESS:
      case APP_STATUS.FAILED:
        btnsGroup = [];
        break;
      default:
        break;
    }
    if (appRdupmType === 'chart') {
      if (!metricDeployStatus) {
        btnsGroup.push(enableMonitor);
      } else {
        btnsGroup.push(disableMonitor);
      }
    }
    return btnsGroup.length ? [{
      name: '更多操作',
      groupBtnItems: btnsGroup,
    }] : [];
  })();

  const getRunningHeaderItemsOfServices = () => {
    let data = [];
    if (appCatergory.code === DEPLOY_CATERGORY) {
      data = [modifyAppObj, ...moreOpts];
    } else {
      data = [modifyValues, modifyAppObj, redeploy, createSource, ...moreOpts];
    }
    return data;
  };

  const getRunningHeaderItemsOfMarket = () => {
    let data = [];
    if (appCatergory.code === DEPLOY_CATERGORY) {
      data = [modifyAppObj, deleteApp, ...moreOpts];
    } else {
      data = [modifyAppObj, deleteApp, createSource, upGrade, redeploy, ...moreOpts];
    }
    return data;
  };

  // 项目分组
  const getIsServicesActionData = () => {
    let data: any = [];
    switch (appStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        data = getRunningHeaderItemsOfServices();
        break;
      case APP_STATUS.FAILED:
      case APP_STATUS.STOP:
        data = [modifyValues, modifyAppObj, redeploy, ...moreOpts];
        break;
      default:
        break;
    }
    return data;
  };

  // 应用市场分组
  const getIsMarketActionData = () => {
    let data: any = [];
    switch (appStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        data = getRunningHeaderItemsOfMarket();
        break;
      case APP_STATUS.STOP:
      case APP_STATUS.FAILED:
        data = [redeploy, ...moreOpts];
        break;
      default:
        break;
    }
    return data;
  };

  // 主机分组
  const getIsHostActionData = () => {
    let data: any = [];
    let extra: any = [];
    const hostStatus = appRecord?.toData()?.hostStatus;
    const rdupm = appRecord?.toData()?.rdupm;
    const status = appRecord?.toData()?.status;
    switch (devopsHostCommandDTO?.status) {
      case APP_STATUS.SUCCESS:
      case APP_STATUS.FAILED:
        if (rdupm === DOCKER_TYPE) {
          if (status === APP_STATUS.RUNNING) {
            extra = [...extra, stopApp, restartApp];
          } else if (status === APP_STATUS.CREATED) {
            extra = [...extra, activeApp, restartApp];
          } else if (status === APP_STATUS.EXITED) {
            extra = [...extra, restartApp];
          }
        }
        data = [...rdupmType === DOCKER_TYPE ? [deleteApp] : [deleteApp, ...moreOpts], ...extra?.length > 0 ? [{
          name: '容器操作',
          groupBtnItems: extra,
        }] : []];
        if (rdupmType !== 'middleware') {
          data.unshift(modifyAppObj);
        }
        if (rdupmType === 'docker_compose') {
          data.unshift(reDeploy);
        }
        break;
      default:
        break;
    }
    if (hostStatus !== HOST_CONNECTED) {
      data = data.map((i: any) => ({
        ...i,
        disabled: true,
        tooltipsConfig: {
          title: '主机处于未连接状态，无法操作',
        },
      }));
    }
    return data;
  };

  const headerBtnsItems = () => {
    let data = [];
    switch (whichGroup) {
      case IS_MARKET:
        data = getIsMarketActionData();
        break;
      case IS_SERVICE:
        data = getIsServicesActionData();
        break;
      case IS_HOST:
        data = getIsHostActionData();
        break;
      default:
        break;
    }
    return [...data, {
      icon: 'refresh',
      iconOnly: true,
      handler: () => appDs.query(),
    }];
  };

  return <HeaderButtons showClassName items={headerBtnsItems()} />;
};

export default observer(DetailsTabsHeaderButtons);
