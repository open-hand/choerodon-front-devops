/* eslint-disable max-len */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { UserInfo, TimePopover, StatusTag } from '@choerodon/components';
import EnvItem from '@/components/env-item';
import PodCircle from '@/components/pod-circle';
import { useAppDetailsStore } from '../../stores';
import './index.less';
import { getAppCategories } from '@/routes/app-center-pro/utils';
import {
  CHART_CATERGORY,
  CHART_HZERO, CHART_MARKET, CHART_MIDDLEWARE, CHART_NORMAL, CHART_REPO, CHART_SHARE, CHART_UPLOAD, ENV_TAB, HOST_TAB,
} from '@/routes/app-center-pro/stores/CONST';

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
    prodJarInfoVO,
    devopsHostCommandDTO,
  } = appDs.current?.toData() || {};

  const {
    imageUrl,
    ldap,
    loginName,
    realName,
    email,
  } = creator;

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
      case 'failed':
        message = formatMessage({ id: 'deploy_failed' });
        break;
      case 'operating':
        message = formatMessage({ id: 'pending' });
        break;
      default:
        break;
    }
    return <StatusTag name={message} colorCode={objectStatus} />;
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
            {getChartSourceName[chartSource]}
            <br />
            服务编码：
            {appServiceCode}
            )
          </span>
        </div>
      </div>
      <div>
        <span>Chart版本</span>
        {versionName || getVersionName()}
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
        <div className={`${subfixCls}-aside-main-chart-source`}>
          <span>
            {getChartSourceName[sourceType]}
          </span>
          <span>
            (artifactId：
            {prodJarInfoVO?.artifactId}
            <br />
            groupId：
            {prodJarInfoVO?.groupId}
            <br />
            Jar包版本：
            {prodJarInfoVO?.version}
            )
          </span>
        </div>
      </div>
    </>
  );

  const renderStatus = () => {
    if (deployType === HOST_TAB) {
      const operateStatus = devopsHostCommandDTO?.status;
      const error = devopsHostCommandDTO?.error;
      return (operateStatus && !(operateStatus === 'success') && (
        <StatusTag
          style={{
            marginLeft: '5px',
          }}
          ellipsisTitle={error}
          colorCode={operateStatus}
          name={operateStatus === 'operating' ? '执行中' : '失败'}
        />
      ));
    }
    return (
      <PodCircle
        // @ts-expect-error
        style={{
          width: 22,
          height: 22,
        }}
        dataSource={[{
          name: 'running',
          value: podRunningCount,
          stroke: '#0bc2a8',
        }, {
          name: 'unlink',
          value: podCount - podRunningCount,
          stroke: '#fbb100',
        }]}
      />
    );
  };

  return (
    <div className={`${subfixCls}-aside`}>
      <header>
        {renderStatus()}
        <span className={`${subfixCls}-aside-name`}>{name || '-'}</span>
      </header>
      <main>
        <h3>详情</h3>
        <div className={`${subfixCls}-aside-main-content`}>
          <div>
            <span>应用编码</span>
            <span>{code || '-'}</span>
          </div>
          {deployType === ENV_TAB && renderEnv()}
          {deployType === HOST_TAB && renderHost()}
          <div>
            <span>部署方式</span>
            <span>{deployWay || '主机部署' || '-'}</span>
          </div>
          <div>
            <span>部署对象</span>
            <span>{appCatergory?.name || '-'}</span>
          </div>
          { appCatergory?.code === CHART_CATERGORY && renderChartDetails()}
          {
            deployType === HOST_TAB && renderJar()
          }
          <div>
            <span>创建时间</span>
            <TimePopover content={creationDate} />
          </div>
          <div>
            <span>创建者</span>
            <UserInfo realName={realName} loginName={ldap ? loginName : email} avatar={imageUrl} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default observer(DetailAside);
