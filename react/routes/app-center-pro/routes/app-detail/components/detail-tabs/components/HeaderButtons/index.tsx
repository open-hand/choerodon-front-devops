/* eslint-disable max-len */
import React, { useMemo } from 'react';
import { HeaderButtons } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { useHistory, useLocation } from 'react-router';
import { useAppDetailTabsStore } from '../../stores';
import { openModifyValueModal } from '@/components/modify-values';
import { useAppDetailsStore } from '../../../../stores';
import { openNetWorkFormModal } from '@/components/create-network';
import { openDomainFormModal } from '@/components/domain-form';
import { openRedeploy } from '@/components/reDeploy';
import { openChangeActive } from '@/components/app-status-toggle';
import { openMarketUpgradeModal } from '@/components/app-upgrade';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import {
  APP_STATUS, CHART_CATERGORY, DEPLOY_CATERGORY, ENV_TAB, HOST_CATERGORY, IS_HOST, IS_MARKET, IS_SERVICE,
} from '@/routes/app-center-pro/stores/CONST';
import { getChartSourceGroup } from '@/routes/app-center-pro/utils';

const DetailsTabsHeaderButtons = () => {
  const {
    deleteHostApp,
    deletionStore,
  } = useAppCenterProStore();
  const {
    refresh,
    projectId,
  } = useAppDetailTabsStore();

  const history = useHistory();
  const location = useLocation();

  const {
    appDs,
    appId: appCenterId,
    deployTypeId: hostOrEnvId,
    deployType,
    appCatergory,
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
  } = appRecord?.toData() || {};

  const isMarket = chartSource === 'market' || chartSource === 'hzero';

  const isMiddleware = chartSource === 'middleware';

  const whichGroup = getChartSourceGroup(
    chartSource, deployType,
  );

  // 修改应用（3种分类）
  const modifyAppObj = useMemo(() => {
    let obj;
    switch (appCatergory.code) {
      case CHART_CATERGORY:
        obj = {
          name: '修改应用（chart包）',
        };
        break;
      case DEPLOY_CATERGORY:
        obj = {
          name: '修改应用（部署组）',
          // icon: 'add_comment-o',
          groupBtnItems: [
            {
              name: '修改应用配置',
            },
            {
              name: '修改容器配置',
            },
          ],
        };
        break;
      case HOST_CATERGORY:
        obj = {
          name: '修改应用（jar包）',
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
    handler: () => openRedeploy({
      appServiceId,
      commandVersion,
      projectId,
      refresh,
    }),
  };

  // 启用应用
  const activeApp = {
    name: '启用应用',
    // icon: 'check',
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
    handler: () => {
      deployType === ENV_TAB ? deletionStore.openDeleteModal({
        envId: hostOrEnvId,
        instanceId,
        callback: () => {
          history.push({ pathname: '/devops/application-center', search: location.search });
        },
        instanceName: name,
        type: 'instance',
      }) : deleteHostApp(hostOrEnvId, instanceId);
    },
  };

  // 升级
  const upGrade = {
    name: '升级',
    icon: 'rate_review1',
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
    switch (appStatus) {
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
    return btnsGroup.length ? {
      name: '更多操作',
      groupBtnItems: btnsGroup,
    } : null;
  })();

  // 项目分组
  const getIsServicesActionData = () => {
    let data:any = [];
    switch (appStatus) {
      case APP_STATUS.ACTIVE:
        data = [modifyValues, modifyAppObj, redeploy, createSource, moreOpts];
        break;
      case APP_STATUS.FAILED:
      case APP_STATUS.STOP:
        data = [moreOpts];
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
      case APP_STATUS.ACTIVE:
        data = [modifyValues, upGrade, redeploy, moreOpts];
        break;
      case APP_STATUS.STOP:
        data = [moreOpts];
        break;
      default:
        break;
    }
    return data;
  };

  // 主机分组
  const getIsHostActionData = () => {
    let data:any = [];
    switch (appStatus) {
      case APP_STATUS.SUCCESS:
      case APP_STATUS.FAILED:
        data = [modifyAppObj, moreOpts];
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
      handler: refresh,
    }];
  };

  return <HeaderButtons showClassName items={headerBtnsItems()} />;
};

export default observer(DetailsTabsHeaderButtons);
