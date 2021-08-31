/* eslint-disable max-len */
import React from 'react';
import { Action } from '@choerodon/master';
import { observer } from 'mobx-react-lite';

import { useHistory, useLocation } from 'react-router';
import {
  UserInfo, TimePopover, CardPagination, StatusTag,
} from '@choerodon/components';
import { Tooltip } from 'choerodon-ui/pro';
import EnvItem from '@/components/env-item';
import { Record } from '@/interface';
import AppType from '@/routes/app-center-pro/components/AppType';
import { useAppHomePageStore } from '../../stores';

import './index.less';
import { getAppCategories, getChartSourceGroup } from '@/routes/app-center-pro/utils';
import {
  APP_STATUS, CHART_HOST, HOST_TAB, IS_HOST, IS_MARKET, IS_SERVICE,
} from '@/routes/app-center-pro/stores/CONST';
import { openChangeActive } from '@/components/app-status-toggle';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import EnvOrHostStatusIcon from '@/routes/app-center-pro/components/EnvOrHostStatusIcon';

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
    openDeleteHostAppModal,
    deleteEnvApp,
  } = useAppCenterProStore();

  const {
    mainStore,
    typeTabKeys,
    projectId,
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

    creator = {},

    code,
    rdupmType, // 部署对象
    operationType, // 操作类型
    chartSource, // 制品来源

    status: appStatus, // 应用状态
    objectId: instanceId,
    code: instanceName,

    creationDate,

    podRunningCount,
    podUnlinkCount,
    podCount,
  } = record.toData();

  const {
    imageUrl,
    ldap,
    loginName,
    realName,
    email,
  } = creator;

  const currentType = mainStore.getCurrentTypeTabKey;

  const isEnv = currentType === typeTabKeys.ENV_TAB;

  const isHost = currentType === typeTabKeys.HOST_TAB;

  const deployTypeId = isEnv ? envId : hostId;

  const history = useHistory();

  const { search, pathname } = useLocation();

  const toggleActive = (active:'stop' | 'start') => openChangeActive({
    active,
    name,
    callback: refresh,
    projectId,
    envId,
    instanceId,
  });

  const handleDelete = () => {
    isEnv ? deleteEnvApp({
      appCatergoryCode: getAppCategories(rdupmType, currentType).code,
      envId,
      instanceId,
      instanceName,
      callback: refresh,
    }) : openDeleteHostAppModal(hostId, id, refresh);
  };

  const stopObj = {
    service: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    text: '停用',
    action: () => toggleActive('stop'),
  };

  const activeObj = {
    service: ['choerodon.code.project.deploy.app-deployment.application-center.app-toggle-status'],
    text: '启用',
    action: () => toggleActive('start'),
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

  const getIsMarketActionData = () => {
    let data:any = [];
    switch (appStatus) {
      case APP_STATUS.RUNNING:
      case APP_STATUS.ACTIVE:
        data = [stopObj, deleteObj];
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

  const catergory = getAppCategories(rdupmType, currentType);

  return (
    <div className={`${subfixCls}-list-card`}>
      <aside>
        {renderAction()}
      </aside>
      <header>
        <EnvOrHostStatusIcon
          hostError={devopsHostCommandDTO?.error}
          hostStatus={devopsHostCommandDTO?.status}
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
        <AppType type={operationType} />
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
          <span>{catergory.name}</span>
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        >
          <span>创建</span>
          <UserInfo avatar={imageUrl} realName={realName} loginName={ldap ? loginName : email} />
          <TimePopover
            style={{
              marginLeft: '4px',
            }}
            content={creationDate}
          />
        </div>
      </main>
    </div>
  );
});

const AppCardContent = () => {
  const {
    subfixCls,
    listDs,
    refresh,
  } = useAppHomePageStore();

  const renderList = () => listDs.map((record:Record) => <AppItem refresh={refresh} subfixCls={subfixCls} record={record} key={record.id} />);

  return (
    <>
      <div className={`${subfixCls}-list`}>
        {
          renderList()
        }
      </div>
      <CardPagination hideOnSinglePage className={`${subfixCls}-list-pagination`} dataSet={listDs as any} showFirstAndLastBtn />
    </>
  );
};

export default observer(AppCardContent);
