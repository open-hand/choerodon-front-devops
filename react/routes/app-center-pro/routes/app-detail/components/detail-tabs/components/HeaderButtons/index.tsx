/* eslint-disable max-len */
import React, { useMemo } from 'react';
import { HeaderButtons } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import DeployGroupConfigModal from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config';
import DeployGroupAppModal from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config';
import { useAppDetailTabsStore } from '../../stores';
import { openModifyValueModal } from '@/components/modify-values';
import { useAppDetailsStore } from '../../../../stores';
import { openNetWorkFormModal } from '@/components/create-network';
import { openDomainFormModal } from '@/components/domain-form';
import { openRedeploy } from '@/components/reDeploy';
import { openChangeActive } from '@/components/app-status-toggle';
import { openMarketUpgradeModal } from '@/components/app-upgrade';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import { openHostAppConfigModal } from '../../../../../../components/OpenAppCreateModal/components/host-app-config';
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

const deployGroupConfig = Modal.key();
const deployGroupApp = Modal.key();

const DetailsTabsHeaderButtons = () => {
  const {
    deleteHostApp,
    goBackHomeBaby,
    deleteEnvApp,
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
  } = appRecord?.toData() || {};

  const isMarket = chartSource === 'market' || chartSource === 'hzero';

  const isMiddleware = chartSource === 'middleware';

  const whichGroup = getChartSourceGroup(
    chartSource || sourceType, deployType,
  );

  // 部署组修改容器配置
  function openDeployGroupConfig() {
    Modal.open({
      key: deployGroupConfig,
      title: '修改容器配置',
      children: <DeployGroupConfigModal />,
      okText: '修改',
    });
  }

  // 部署组修改应用
  function openDeployGroupApp() {
    Modal.open({
      key: deployGroupApp,
      title: '修改应用',
      children: <DeployGroupAppModal />,
      okText: '修改',
    });
  }

  // 修改应用（3种分类）
  const modifyAppObj = useMemo(() => {
    let obj;
    switch (appCatergory.code) {
      case CHART_CATERGORY:
        obj = {
          name: '修改应用',
          icon: 'add_comment-o',
        };
        break;
      case DEPLOY_CATERGORY:
        obj = {
          name: '修改应用',
          groupBtnItems: [
            {
              name: '修改应用配置',
              handler: openDeployGroupApp,
            },
            {
              name: '修改容器配置',
              handler: openDeployGroupConfig,
            },
          ],
        };
        break;
      case HOST_CATERGORY:
        obj = {
          name: '修改应用',
          handler: () => {
            openHostAppConfigModal(appId, refresh);
          },
          icon: 'add_comment-o',
        };
        break;
      default:
        break;
    }
    return obj;
  }, [appCatergory.code]);

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
    // icon: 'check',
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    handler: () => openChangeActive({
      active: 'start',
      name,
      callback: refresh,
      projectId,
      envId: hostOrEnvId,
      instanceId,
    }),
  };

  // 停用应用
  const stopApp = {
    name: '停用应用',
    // icon: 'do_not_disturb_alt',
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    handler: () => openChangeActive({
      active: 'stop',
      name,
      callback: refresh,
      projectId,
      envId: hostOrEnvId,
      instanceId,
    }),
  };

  // 删除应用
  const deleteApp = {
    name: '删除应用',
    // icon: 'delete_forever-o',
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-delete'],
    handler: () => {
      deployType === ENV_TAB ? deleteEnvApp({
        appCatergoryCode: getAppCategories(rdupmType, deployType).code,
        envId: hostOrEnvId,
        instanceId,
        instanceName: instanceName || objectName,
        callback: goBackHomeBaby,
      }) : deleteHostApp(hostOrEnvId, instanceId, goBackHomeBaby);
    },
  };

  // 升级
  const upGrade = {
    name: '升级',
    icon: 'rate_review1',
    permissions: ['choerodon.code.project.deploy.app-deployment.application-center.app-upgrade'],
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

  // 项目分组
  const getIsServicesActionData = () => {
    let data:any = [];
    switch (appStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        data = [modifyValues, modifyAppObj, redeploy, createSource, ...moreOpts];
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
        data = [modifyValues, upGrade, redeploy, ...moreOpts];
        break;
      case APP_STATUS.STOP:
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
