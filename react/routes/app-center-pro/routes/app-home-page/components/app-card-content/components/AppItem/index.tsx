/* eslint-disable max-len */
import React from 'react';
import { Action } from '@choerodon/master';
import { useHistory, useLocation } from 'react-router';

import { Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Record } from '@/interface';
import EnvItem from '@/components/env-item';
import { getAppCategories, getChartSourceGroup } from '@/routes/app-center-pro/utils';
import {
  APP_STATUS, CHART_CATERGORY, CHART_HOST, IS_HOST, IS_MARKET, IS_SERVICE,
} from '@/routes/app-center-pro/stores/CONST';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import AppCenterProServices from '../../../../../../services';
import EnvOrHostStatusIcon from '@/routes/app-center-pro/components/EnvOrHostStatusIcon';
import { useAppHomePageStore } from '../../../../stores';
import AppStatus from '@/routes/app-center-pro/components/AppStatus';
import UPDATE_IMG from '@/routes/app-center-pro/assets/update.svg';
import { openMarketUpgradeModal } from '@/components/app-upgrade';
import { openHzeroUpgradeModal } from '@/components/app-upgrade-hzero';
import openDeleteHostAppModal from '@/components/app-deletion-host';

const AppItem = observer(({
  record,
  subfixCls,
  refresh,
}: {
  record: Record
  subfixCls:string
  refresh:(...agrs:any[])=>any
}) => {
  const {
    deleteEnvApp,
  } = useAppCenterProStore();

  const {
    typeTabKeys,
    projectId,
    searchDs,
  } = useAppHomePageStore();

  const {
    name,
    id,

    envName,
    envId,
    envConnected,
    envActive,

    hostId,
    hostName,
    devopsHostCommandDTO,
    appServiceId,
    appServiceName,
    appServiceVersionId,

    code,
    rdupmType, // 部署对象
    chartSource, // 制品来源

    status: appStatus, // 应用状态
    objectId: instanceId,
    error,
    podRunningCount,
    podCount,

    // 市场应用
    upgradeAvailable,
    currentVersionAvailable,
  } = record.toData();

  const currentType = searchDs.current?.get('typeKey');

  const isEnv = currentType === typeTabKeys.ENV_TAB;

  const isHost = currentType === typeTabKeys.HOST_TAB;

  const deployTypeId = isEnv ? envId : hostId;

  const history = useHistory();

  const catergory = getAppCategories(rdupmType, currentType);

  const appCatergoryCode = catergory.code;

  // 应用市场
  const isHzero = chartSource === 'hzero';

  const isMarket = chartSource === 'market' || isHzero;
  const isMiddleware = chartSource === 'middleware';

  const { search, pathname } = useLocation();

  const handleDelete = () => {
    isEnv ? deleteEnvApp({
      appCatergoryCode,
      envId,
      instanceId,
      instanceName: name,
      callback: refresh,
      appId: id,
    }) : openDeleteHostAppModal(hostId, id, name, refresh);
  };

  const stopObj = {
    service: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    text: '停用',
    action: () => AppCenterProServices.toggleActive({
      active: 'stop',
      refresh,
      name,
      instanceId,
      envId,
      appCatergoryCode,
      projectId,
    }),
  };

  const activeObj = {
    service: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    text: '启用',
    action: () => AppCenterProServices.toggleActive({
      active: 'start',
      refresh,
      name,
      instanceId,
      envId,
      appCatergoryCode,
      projectId,
    }),
  };

  const deleteObj = {
    service: ['choerodon.code.project.deploy.app-deployment.application-center.app-delete'],
    text: '删除',
    action: handleDelete,
  };

  const getIsServicesActionData = () => {
    let data:any = [];
    switch (appStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        data = [stopObj, deleteObj];
        break;
      case APP_STATUS.FAILED:
        data = [deleteObj];
        break;
      case APP_STATUS.STOP:
        data = [activeObj, deleteObj];
        break;
      default:
        break;
    }
    return data;
  };

  const getRunningHeaderItemsOfServices = () => {
    const data = [stopObj, deleteObj];
    const situation = catergory.code === CHART_CATERGORY && envConnected && chartSource === 'market' && upgradeAvailable && currentVersionAvailable;
    const openModalHandle = isHzero ? openHzeroUpgradeModal : openMarketUpgradeModal;
    if (situation) {
      data.push({
        service: ['choerodon.code.project.deploy.app-deployment.application-center.app-upgrade'],
        action: () => openModalHandle({
          instanceId,
          appServiceId,
          appServiceName,
          envId,
          appServiceVersionId,
          callback: refresh,
          isMiddleware,
          isHzero,
        }),
        text: '升级',
      });
    }
    return data;
  };

  const getIsMarketActionData = () => {
    let data:any = [];
    switch (appStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        data = getRunningHeaderItemsOfServices();
        break;
      case APP_STATUS.STOP:
        data = [activeObj, deleteObj];
        break;
      case APP_STATUS.FAILED:
        data = [deleteObj];
        break;
      default:
        break;
    }
    return data;
  };

  const getIsHostActionData = () => {
    let data:any = [];
    switch (devopsHostCommandDTO?.status) {
      case APP_STATUS.SUCCESS:
      case APP_STATUS.FAILED:
        data = [deleteObj];
        break;
      default:
        break;
    }
    return data;
  };

  const renderAction = () => {
    const whichGroup = getChartSourceGroup(
      chartSource, currentType,
    );
    let data = [];
    switch (whichGroup) {
      case IS_SERVICE:
        data = getIsServicesActionData();
        break;
      case IS_MARKET:
        data = getIsMarketActionData();
        break;
      case IS_HOST:
        data = getIsHostActionData();
        break;
      default:
        break;
    }
    return data.length ? <Action data={data} /> : '';
  };

  function handleLinkToAppDetail() {
    history.push({
      pathname: `${pathname}/detail/${id}/${chartSource || CHART_HOST}/${currentType}/${deployTypeId}/${rdupmType}`,
      search,
    });
  }

  return (
    <div className={`${subfixCls}-list-card`}>
      <aside>
        {((isEnv && envConnected) || isHost) && renderAction()}
      </aside>
      {
        upgradeAvailable && currentVersionAvailable && (
          <img className={`${subfixCls}-list-card-update`} src={UPDATE_IMG} alt="img" />
        )
      }
      <header>
        <EnvOrHostStatusIcon
          podRunningCount={podRunningCount}
          podCount={podCount}
          currentType={currentType}
        />
        <Tooltip title={name}>
          <span
            role="none"
            onClick={handleLinkToAppDetail}
            className={`${subfixCls}-list-card-appname`}
          >
            {name || '-'}
          </span>
        </Tooltip>
        <AppStatus error={error || devopsHostCommandDTO?.error} status={isEnv ? appStatus : devopsHostCommandDTO?.status} deloyType={currentType} />
      </header>
      <main>
        <div>
          <span>应用编码</span>
          <Tooltip title={code}>
            <span>{code || '-'}</span>
          </Tooltip>
        </div>
        <div>
          <span>部署对象</span>
          <span>{catergory?.name}</span>
        </div>
        {isHost && (
        <div>
          <span>主机</span>
          <Tooltip title={hostName}>
            <span>{hostName}</span>
          </Tooltip>
        </div>
        )}
        {
          isEnv && (
          <div>
            <span>环境</span>
            <Tooltip title={envName}>
              {/* @ts-expect-error */}
              <EnvItem connect={envConnected} active={envActive} name={envName} />
            </Tooltip>
          </div>
          )
        }
      </main>
    </div>
  );
});

export default AppItem;
