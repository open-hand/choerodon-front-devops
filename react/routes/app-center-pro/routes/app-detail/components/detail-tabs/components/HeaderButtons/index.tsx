/* eslint-disable max-len */
import React, { useMemo } from 'react';
import { HeaderButtons } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { useAppDetailTabsStore } from '../../stores';
import { openModifyValueModal } from '@/components/modify-values';
import { useAppDetailsStore } from '../../../../stores';
import { openNetWorkFormModal } from '@/components/create-network';
import { openDomainFormModal } from '@/components/domain-form';
import { openRedeploy } from '@/components/reDeploy';
import { openMarketUpgradeModal } from '@/components/app-upgrade';
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
} from '@/routes/app-center-pro/stores/CONST';
import { getAppCategories, getChartSourceGroup } from '@/routes/app-center-pro/utils';
import AppCenterProServices from '@/routes/app-center-pro/services';
import {
  openAppConfigModal, openContainerConfigModal, openDeployGroupConfigModal, openHostAppConfigModal,
} from '@/components/appCenter-editModal';

const DetailsTabsHeaderButtons = () => {
  const {
    openDeleteHostAppModal,
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
  } = useAppDetailsStore();

  const appRecord = appDs.current;

  const {
    appServiceVersionId,
    appServiceName,
    appServiceId,
    instanceId,
    chartSource,
    commandVersion,
    name,
    objectStatus: appStatus,
    devopsHostCommandDTO = {},
    sourceType,
    instanceName,
    objectName,

    upgradeAvailable,
    currentVersionAvailable,
  } = appRecord?.toData() || {};

  const isMarket = chartSource === 'market' || chartSource === 'hzero';

  const isMiddleware = chartSource === 'middleware';

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
              handler: () => openDeployGroupConfigModal(appRecord?.toData(), refresh),
              permissions: ['choerodon.code.project.deploy.app-deployment.application-center.updateChart choerodon.code.project.deploy.app-deployment.application-center.updateDeployGroupApp'],
            },
            {
              name: '修改容器配置',
              handler: () => openContainerConfigModal(appRecord?.toData(), refresh),
              permissions: ['choerodon.code.project.deploy.app-deployment.application-center.updateDeployGroupContainer'],

            },
          ],
        };
        break;
      case HOST_CATERGORY:
        obj = {
          name: '修改应用',
          handler: () => {
            openHostAppConfigModal(appRecord?.toData() || {}, refresh);
          },
          permissions: ['choerodon.code.project.deploy.app-deployment.application-center.updateHost'],
          icon: 'add_comment-o',
        };
        break;
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
          handler: () => {
            openNetWorkFormModal({
              envId: hostOrEnvId, appServiceId, refresh,
            });
          },
        },
        {
          name: '创建域名',
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

  // 修改values
  const modifyValues = {
    name: '修改Values',
    icon: 'rate_review1',
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-values-modify'],
    handler: () => openModifyValueModal({
      appServiceVersionId,
      appServiceId,
      instanceId,
      isMarket,
      isMiddleware,
      envId: hostOrEnvId,
    }),
  };

  // 重新部署
  const redeploy = {
    name: '重新部署',
    icon: 'redeploy_line',
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
    // icon: 'do_not_disturb_alt',
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    handler: () => AppCenterProServices.toggleActive({
      active: 'stop',
      name,
      refresh,
      projectId,
      envId: hostOrEnvId,
      instanceId,
      appCatergoryCode: appCatergory.code,
    }),
  };

  // 删除应用
  const deleteApp = {
    name: '删除应用',
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-delete'],
    handler: () => {
      deployType === ENV_TAB ? deleteEnvApp({
        appCatergoryCode: getAppCategories(rdupmType, deployType).code,
        envId: hostOrEnvId,
        instanceId,
        instanceName: instanceName || objectName,
        callback: goBackHomeBaby,
      }) : openDeleteHostAppModal(hostOrEnvId, appId, goBackHomeBaby);
    },
  };

  // 升级
  const upGrade = {
    name: '升级',
    icon: 'rate_review1',
    disabled: !upgradeAvailable || !currentVersionAvailable,
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-upgrade'],
    tooltipsConfig: {
      placement: 'bottom',
      title: (!upgradeAvailable || !currentVersionAvailable) ? formatMessage({ id: `c7ncd.deployment.instance.disable.message${upgradeAvailable ? '.upgrade' : ''}` }) : '',
    },
    handler: () => openMarketUpgradeModal({
      instanceId,
      appServiceId,
      appServiceName,
      envId: hostOrEnvId,
      appServiceVersionId,
      callback: refresh,
      isMiddleware,
    }),
  };

  // 更多操作
  const moreOpts = (() => {
    let btnsGroup:any[] = [];
    const currentStatus = deployType === ENV_TAB ? appStatus : devopsHostCommandDTO?.status;
    switch (currentStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        btnsGroup = [stopApp, deleteApp];
        break;
      case APP_STATUS.STOP:
        btnsGroup = [activeApp, deleteApp];
        break;
      case APP_STATUS.SUCCESS:
      case APP_STATUS.FAILED:
        btnsGroup = [deleteApp];
        break;
      default:
        break;
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
      data = [modifyAppObj, ...moreOpts];
    } else {
      data = [modifyValues, modifyAppObj, upGrade, redeploy, ...moreOpts];
    }
    return data;
  };

  // 项目分组
  const getIsServicesActionData = () => {
    let data:any = [];
    switch (appStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        data = getRunningHeaderItemsOfServices();
        break;
      case APP_STATUS.FAILED:
      case APP_STATUS.STOP:
        data = [...moreOpts];
        break;
      default:
        break;
    }
    return data;
  };

  // 应用市场分组
  const getIsMarketActionData = () => {
    let data:any = [];
    switch (appStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        data = getRunningHeaderItemsOfMarket();
        break;
      case APP_STATUS.STOP:
      case APP_STATUS.FAILED:
        data = [...moreOpts];
        break;
      default:
        break;
    }
    return data;
  };

  // 主机分组
  const getIsHostActionData = () => {
    let data:any = [];
    switch (devopsHostCommandDTO?.status) {
      case APP_STATUS.SUCCESS:
      case APP_STATUS.FAILED:
        data = [modifyAppObj, ...moreOpts];
        break;
      default:
        break;
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
