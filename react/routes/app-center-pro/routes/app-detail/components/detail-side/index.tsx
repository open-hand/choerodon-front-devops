/* eslint-disable max-len */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip } from 'choerodon-ui/pro';
import { UserInfo, TimePopover, StatusTag } from '@choerodon/components';
import EnvOrHostStatusIcon from '../../../../components/EnvOrHostStatusIcon';
import EnvItem from '@/components/env-item';
import { useAppDetailsStore } from '../../stores';
import './index.less';
import {
  CHART_CATERGORY,
  CHART_HZERO,
  CHART_MARKET,
  CHART_MIDDLEWARE,
  CHART_NORMAL,
  CHART_REPO,
  CHART_SHARE,
  CHART_UPLOAD,
  ENV_TAB,
  HOST_CATERGORY,
  HOST_TAB,
  OTHER_CATERGORY,
  MIDDLWARE_CATERGORY,
} from '@/routes/app-center-pro/stores/CONST';
import AppStatus from '@/routes/app-center-pro/components/AppStatus';

const DetailAside = () => {
  const {
    subfixCls,
    appDs,
    deployType,
    appCatergory,
    formatMessage,
  } = useAppDetailsStore();

  const {
    name,
    code,

    appServiceCode,
    appServiceName,
    deployWay,

    sourceType,
    chartSource,

    creationDate,
    updatedDate,
    rdupmType,
    objectStatus,
    creator = {},
    podRunningCount,
    podUnlinkCount,
    podCount,

    envActive,
    envName,
    envId,
    envCode,
    envConnected,

    versionName,

    // 这些是主机特有的
    hostName,
    hostId,
    status: hostStatus,
    // prodJarInfoVO,
    devopsHostCommandDTO,
    artifactId,
    groupId,
    version,
    fileInfoVO,
    middlewareVersion,
    middlewareMode,

    error,
  } = appDs.current?.toData() || {};

  const {
    imageUrl,
    ldap,
    loginName,
    realName,
    email,
  } = creator;

  const isEnv = deployType === ENV_TAB;

  const isHost = deployType === HOST_TAB;

  const getChartSourceName:any = {
    [CHART_HZERO]: 'HZERO服务',
    [CHART_MARKET]: '市场服务',
    [CHART_MIDDLEWARE]: '中间件',
    [CHART_SHARE]: '共享服务',
    [CHART_REPO]: '项目制品库',
    [CHART_NORMAL]: '项目服务',
    [CHART_UPLOAD]: '本地上传',
  };

  function getVersionName() {
    let message = '';
    switch (objectStatus) {
      case 'running':
        message = formatMessage({ id: 'running' });
        break;
      case 'failed':
        message = formatMessage({ id: 'deploy_failed' });
        break;
      case 'operating':
        message = formatMessage({ id: 'pending' });
        break;
      default:
        break;
    }
    return (
      <StatusTag ellipsisTitle={objectStatus === 'operating' ? `部署版本"${versionName}"` : ''} name={message} colorCode={objectStatus} />
    );
  }

  const renderChartDetails = () => (
    <>
      <div>
        <span>Chart来源</span>
        <div className={`${subfixCls}-aside-main-chart-source`}>
          <span>
            {appServiceName}
            应用服务
          </span>
          <span>
            (服务来源：
            {getChartSourceName[chartSource] || 'UNKNOWN'}
            <br />
            服务编码：
            {appServiceCode || '-'}
            )
          </span>
        </div>
      </div>
      <div>
        <span>Chart版本</span>
        {objectStatus === 'running' ? versionName : getVersionName()}
      </div>
    </>
  );

  const renderEnv = () => (
    <div>
      <span>环境</span>
      <span style={{
        display: 'flex',
        alignItems: 'center',
      }}
      >
        {/* @ts-expect-error */}
        <EnvItem connect={envConnected} active={envActive} name={envName} />
      </span>
    </div>
  );

  const renderHost = () => (
    <div>
      <span>主机</span>
      <span>{hostName || '-'}</span>
    </div>
  );

  const renderJar = () => (
    <>
      <div>
        <span>Jar包来源</span>
        <span>
          {getChartSourceName[sourceType]}
        </span>
      </div>
      <div>
        <span>artifactId：</span>
        <span>{artifactId || '-'}</span>
      </div>
      <div>
        <span>groupId：</span>
        <span>{groupId || '-'}</span>
      </div>
      <div>
        <span>Jar包版本：</span>
        <span>
          <Tooltip title={version}>
            {version || '-'}
          </Tooltip>
        </span>
      </div>
      {sourceType === CHART_UPLOAD && (
      <div>
        <span>Jar包名称</span>
        <span>
          <a href={fileInfoVO?.jarFileUrl} target="_blank" rel="noreferrer">{fileInfoVO?.fileName}</a>
        </span>
      </div>
      )}
    </>
  );

  const renderHostOther = () => (
    <>
      <div>
        <span>应用来源</span>
        <span>
          {getChartSourceName[sourceType]}
        </span>
      </div>
      <div>
        <span>文件名</span>
        <span>
          {
            <a href={fileInfoVO?.uploadUrl}>
              {fileInfoVO?.fileName}
            </a> || '-'
          }
        </span>
      </div>
    </>
  );

  const renderMiddleware = () => (
    <>
      <div>
        <span>部署模式</span>
        <span>{middlewareMode}</span>
      </div>
      <div>
        <span>应用来源</span>
        <span>
          市场基础组件
        </span>
      </div>
      <div>
        <span>版本</span>
        <span>
          {middlewareVersion}
        </span>
      </div>
    </>
  );

  const renderHostDetails = () => {
    if (appCatergory?.code === OTHER_CATERGORY) {
      return renderHostOther();
    }
    if (appCatergory?.code === HOST_CATERGORY) {
      return renderJar();
    }
    if (appCatergory?.code === MIDDLWARE_CATERGORY) {
      return renderMiddleware();
    }
    return null;
  };

  return (
    <div className={`${subfixCls}-aside`}>
      <header>
        <EnvOrHostStatusIcon
          podRunningCount={podRunningCount}
          podCount={podCount}
          currentType={deployType}
        />
        <span className={`${subfixCls}-aside-name`}>{name || '-'}</span>
        <AppStatus error={error || devopsHostCommandDTO?.error} status={isEnv ? objectStatus : devopsHostCommandDTO?.status} deloyType={deployType} />
      </header>
      <main>
        <h3>详情</h3>
        <div className={`${subfixCls}-aside-main-content`}>
          <div>
            <span>应用编码</span>
            <span>{code || '-'}</span>
          </div>
          { isEnv && renderEnv()}
          { isHost && renderHost()}
          <div>
            <span>部署方式</span>
            <span>{deployWay || '主机部署'}</span>
          </div>
          <div>
            <span>部署对象</span>
            <span>{appCatergory?.name || '-'}</span>
          </div>
          { appCatergory?.code === CHART_CATERGORY && renderChartDetails()}
          {
            isHost && renderHostDetails()
          }
          <div>
            <span>创建时间</span>
            <TimePopover content={creationDate} />
          </div>
          <div>
            <span>创建者</span>
            <UserInfo realName={realName} loginName={ldap ? loginName : email} avatar={imageUrl} />
          </div>
          <div>
            <span>最近更新时间</span>
            <TimePopover content={updatedDate} />
          </div>
          <div>
            <span>最近更新者</span>
            <UserInfo realName={realName} loginName={ldap ? loginName : email} avatar={imageUrl} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default observer(DetailAside);
