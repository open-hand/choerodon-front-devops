/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

import React, { useEffect, useState } from 'react';
import {
  Page, Content, Header, Permission, Breadcrumb, Choerodon,
} from '@choerodon/boot';
import {
  Table, Modal, Select, Icon, Tooltip,
} from 'choerodon-ui/pro';
import { Button } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import app from '@/images/app.svg';
import image from '@/images/image.svg';
import jar from '@/images/jar.svg';
import { mapping } from './stores/ListDataSet';
import { useDeployStore } from './stores';
import StatusTag from '../../components/status-tag';
import TimePopover from '../../components/timePopover/TimePopover';
import UserInfo from '../../components/userInfo';
import Deploy from './modals/deploy';
import BatchDeploy from './modals/batch-deploy';
import Tips from '../../components/new-tips';
import StatusDot from '../../components/status-dot';

import './index.less';

const { Column } = Table;
const modalKey1 = Modal.key();
const modalKey2 = Modal.key();
const modalKey3 = Modal.key();
const modalKey4 = Modal.key();
const batchDeployModalKey = Modal.key();
const modalStyle1 = {
  width: 380,
};
const modalStyle2 = {
  width: 'calc(100vw - 3.52rem)',
};
const statusTagsStyle = {
  minWidth: 40,
  marginRight: 8,
};
const STATUS = ['success', 'failed', 'deleted', 'pendingcheck', 'stop', 'running'];

const Deployment = withRouter(observer((props) => {
  const {
    intl: { formatMessage },
    AppState: { currentMenuType: { id, projectId } },
    intlPrefix,
    prefixCls,
    permissions,
    listDs,
    detailDs,
    deployStore,
    pipelineStore,
    envOptionsDs,
    pipelineOptionsDs,
  } = useDeployStore();

  function refresh() {
    envOptionsDs.query();
    pipelineOptionsDs.query();
    listDs.query();
  }

  function openDeploy() {
    Modal.open({
      key: modalKey4,
      style: modalStyle2,
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.manual` }),
      children: <Deploy
        deployStore={deployStore}
        refresh={deployAfter}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        hasHostDeploy
      />,
      afterClose: () => {
        deployStore.setCertificates([]);
        deployStore.setAppService([]);
        deployStore.setConfigValue('');
      },
      okText: formatMessage({ id: 'deployment' }),
    });
  }

  function openBatchDeploy() {
    Modal.open({
      key: batchDeployModalKey,
      style: modalStyle2,
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.batch` }),
      children: <BatchDeploy
        deployStore={deployStore}
        refresh={deployAfter}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
      />,
      afterClose: () => {
        deployStore.setCertificates([]);
        deployStore.setAppService([]);
        deployStore.setShareAppService([]);
        deployStore.setConfigValue('');
      },
      okText: formatMessage({ id: 'deployment' }),
    });
  }

  function linkToInstance(record) {
    const { history, location: { search } } = props;
    if (record) {
      const instanceId = record.get('instanceId');
      const appServiceId = record.get('appServiceId');
      const envId = record.get('envId');
      history.push({
        pathname: '/devops/resource',
        search,
        state: {
          instanceId,
          appServiceId,
          envId,
        },
      });
    }
    history.push(`/devops/resource${search}`);
  }

  function deployAfter(instance, type = 'instance') {
    const { history, location: { search } } = props;
    if (instance.config) {
      history.push(`/devops/deployment-operation${search}`);
    } else {
      history.push({
        pathname: '/devops/resource',
        search,
        state: {
          instanceId: instance.id,
          appServiceId: instance.appServiceId,
          envId: instance.envId,
          viewType: type,
        },
      });
    }
  }

  function renderNumber({ record }) {
    const errorInfo = record.get('errorInfo');
    const deployStatus = record.get('deployStatus');
    const type = record.get('deployType');
    const viewId = record.get('viewId');
    return (
      <>
        <span className={`${prefixCls}-content-table-mark ${prefixCls}-content-table-mark-${type}`}>
          {formatMessage({ id: `${intlPrefix}.type.${type}` })}
        </span>
        <span className={`${prefixCls}-content-table-number`}>
          #
          {viewId}
        </span>
        {errorInfo && deployStatus === 'failed' && (
          <Tooltip title={errorInfo}>
            <Icon type="error" className={`${prefixCls}-content-icon-failed`} />
          </Tooltip>
        )}
      </>
    );
  }

  function renderDeployStatus({ value }) {
    return (
      <StatusTag
        colorCode={value || ''}
        name={value ? formatMessage({ id: `${intlPrefix}.status.${value}` }) : 'unKnow'}
        style={statusTagsStyle}
      />
    );
  }

  function renderExecutor({ value, record }) {
    const {
      realName, loginName, ldap, imageUrl, email,
    } = value || {};
    return (
      <>
        <UserInfo
          name={realName || ''}
          id={ldap ? loginName : email}
          avatar={imageUrl}
          className={`${prefixCls}-content-table-user`}
        />
        <div className={`${prefixCls}-content-table-time`}>
          <span className={`${prefixCls}-content-table-time-text`}>执行于</span>
          <TimePopover content={record.get('deployTime')} />
        </div>
      </>
    );
  }

  function renderInstance({ value, record }) {
    if (record.get('deployMode') === 'host') {
      return '';
    }
    return (
      <span
        className={`${prefixCls}-content-table-instance`}
        onClick={() => linkToInstance(record)}
      >
        {value || '生成实例名称'}
      </span>
    );
  }

  function renderEnv({ value, record }) {
    return (
      <>
        <StatusDot
          synchronize
          connect={record.get('connect')}
          size="small"
        />
        <span className={`${prefixCls}-content-table-env`}>{value}</span>
      </>
    );
  }

  function renderAppService({ value, record }) {
    return (
      <>
        <span className={`${prefixCls}-content-table-appService`}>{value || '应用服务名称'}</span>
        <span className={`${prefixCls}-content-table-version`}>
          版本：
          {record.get('appServiceVersion') || '版本名称'}
        </span>
      </>
    );
  }

  function getBackPath() {
    const { location: { state } } = props;
    const { backPath } = state || {};
    return backPath || '';
  }

  /**
   * 部署方式和载体的渲染
   * @param value
   * @param record
   */
  const renderDeployMethod = ({ value, record }) => {
    const deployMode = record.get('deployMode');
    const deployPayloadName = record.get('deployPayloadName');
    return (
      <span>
        <StatusTag
          color={deployMode === 'host' ? 'rgb(142, 187, 252)' : 'rgb(116, 217, 221)'}
          name={deployMode === 'host' ? '主机' : '环境'}
          style={statusTagsStyle}
        />
        {deployPayloadName}
      </span>
    );
  };

  /**
   * 部署对象渲染
   */
  const renderDeployObejct = ({ value, record }) => {
    const deployObjectType = record.get('deployObjectType');
    const deployObjectName = record.get('deployObjectName');
    const deployObjectVersion = record.get('deployObjectVersion');
    const iconMap = {
      app: {
        img: app,
        text: '应用服务',
      },
      jar: {
        img: jar,
        text: 'jar包',
      },
      image: {
        img: image,
        text: 'Docker镜像',
      },
    };
    return [
      <p className="c7ncd-deploy-content-deployObjectP">
        <Tooltip title={iconMap[deployObjectType]?.text}>
          <img src={iconMap[deployObjectType]?.img} alt="" />
        </Tooltip>
        <span className="c7ncd-deploy-content-deployObjectName">
          {deployObjectName}
        </span>
      </p>,
      <p className="c7ncd-deploy-content-deployObjectP">
        <Tooltip title={deployObjectVersion}>
          <span className="c7ncd-deploy-content-deployObjectVersion">
            版本:
            {' '}
            {deployObjectVersion}
          </span>
        </Tooltip>
      </p>,
    ];
  };

  return (
    <Page
      service={['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.default']}
    >
      <Header title={<FormattedMessage id="app.head" />} backPath={getBackPath()}>
        <Permission
          service={['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.manual']}
        >
          <Button
            icon="jsfiddle"
            onClick={openDeploy}
          >
            <FormattedMessage id={`${intlPrefix}.manual`} />
          </Button>
        </Permission>
        <Permission
          service={['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.batch']}
        >
          <Button
            icon="jsfiddle"
            onClick={openBatchDeploy}
          >
            <FormattedMessage id={`${intlPrefix}.batch`} />
          </Button>
        </Permission>
        <Button
          icon="refresh"
          onClick={() => refresh()}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Breadcrumb />
      <Content className={`${prefixCls}-content`}>
        <Table
          dataSet={listDs}
          // queryBar="advancedBar"
          className={`${prefixCls}-content-table`}
          // queryFieldsLimit={4}
          rowHeight="auto"
        >
          <Column
            name="deployId"
            renderer={renderNumber}
            align="left"
            header={(
              <Tips
                helpText={formatMessage({ id: `${intlPrefix}.id.tips` })}
                title={formatMessage({ id: `${intlPrefix}.number` })}
              />
            )}
            width={150}
          />
          <Column
            header={(
              <Tips
                helpText="部署方式分为：主机部署与环境部署"
                title="部署方式&载体"
              />
            )}
            name={mapping.deployMethod.value}
            renderer={renderDeployMethod}
          />
          <Column
            name="deployResult"
            renderer={renderDeployStatus}
            header="执行结果"
            width={80}
          />
          <Column name="instanceName" renderer={renderInstance} />
          <Column
            name={mapping.deployObject.value}
            renderer={renderDeployObejct}
            header={(
              <Tips
                helpText="部署对象分为：应用服务、jar包与Docker镜像"
                title="部署对象"
              />
          )}
          />
          {/* <Column name="envName" renderer={renderEnv} /> */}
          {/* <Column name="appServiceName" renderer={renderAppService} /> */}
          <Column name="executeUser" renderer={renderExecutor} />
        </Table>
      </Content>
    </Page>
  );
}));

export default Deployment;
