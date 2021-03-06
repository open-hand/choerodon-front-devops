/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Page, Content, Header, Permission, Breadcrumb, Choerodon, HeaderButtons, Action,
} from '@choerodon/boot';
import {
  Table, Modal, Select, Icon, Tooltip,
} from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import app from '@/images/app.svg';
import image from '@/images/image.svg';
import jar from '@/images/jar.svg';
import { StatusTag } from '@choerodon/components';
import { TabCode } from '@choerodon/master';
import { SMALL } from '@/utils/getModalWidth';
import YamlEditor from '@/components/yamlEditor';
import ReactCodeMirror from 'react-codemirror';
import { mapping } from './stores/ListDataSet';
import { useDeployStore } from './stores';
import TimePopover from '../../components/timePopover/TimePopover';
import UserInfo from '../../components/userInfo';
import Deploy from './modals/deploy';
import BaseComDeploy from './modals/base-comDeploy';
import BatchDeploy from './modals/batch-deploy';
import Tips from '../../components/new-tips';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import './index.less';

const { Column } = Table;
const modalKey4 = Modal.key();
const batchDeployModalKey = Modal.key();
const commandModalKey = Modal.key();
const modalStyle2 = {
  width: 'calc(100vw - 3.52rem)',
};
const statusTagsStyle = {
  marginRight: 8,
};

const logOptions = {
  theme: 'base16-dark',
  mode: 'shell',
  readOnly: true,
  lineNumbers: false,
  lineWrapping: true,
};

// eslint-disable-next-line no-undef
const HAS_BASE_PRO = C7NHasModule('@choerodon/base-pro');

const Deployment = withRouter(observer((props) => {
  const {
    intl: { formatMessage },
    AppState: { currentMenuType: { id, projectId } },
    intlPrefix,
    prefixCls,
    listDs,
    deployStore,
    envOptionsDs,
    pipelineOptionsDs,
  } = useDeployStore();

  useEffect(() => {
    const { location: { search } } = props;
    const urlQuery = new URLSearchParams(search);
    if (urlQuery.get('mode') || urlQuery.get('deployType')) {
      openBaseDeploy(urlQuery.get('mode'), urlQuery.get('deployType'));
      urlQuery.delete('mode');
      window.history.replaceState(null, null, `/#/devops/deployment-operation?${urlQuery.toString()}`);
    }
  }, []);

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
        random={Math.random()}
      />,
      afterClose: () => {
        deployStore.setCertificates([]);
        deployStore.setAppService([]);
        deployStore.setConfigValue('');
      },
      okText: formatMessage({ id: 'deployment' }),
    });
  }

  function openBaseDeploy(deployWay, middleware) {
    Modal.open({
      key: Modal.key(),
      style: modalStyle2,
      drawer: true,
      title: '基础组件部署',
      children: <BaseComDeploy
        random={Math.random()}
        {
          ...(deployWay ? {
            deployWay,
          } : {})
        }
        {
          ...(middleware ? {
            middleware,
          } : {})
        }
        refresh={refresh}
      />,
      okText: '部署',
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
        search: `${search}&activeKey=${TabCode.get('/devops/resource').tabCodes[0]}`,
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
      // history.push(`/devops/deployment-operation${search}`);
      refresh();
    } else {
      history.push({
        pathname: '/devops/resource',
        search: `${search}&activeKey=${TabCode.get('/devops/resource').tabCodes[0]}`,
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
        <span
          className={classNames({
            [`${prefixCls}-content-table-mark ${prefixCls}-content-table-mark-${type}`]: true,
            'c7ncd-number-base': type === 'baseComponent',
          })}
        >
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

  function renderDeployStatus({ value, record }) {
    const errMsg = record.get('errorMessage');
    return (
      <>
        <StatusTag
          colorCode={value || ''}
          name={value ? formatMessage({ id: `${intlPrefix}.status.${value}` }) : 'unKnow'}
          style={statusTagsStyle}
        />
        {errMsg && (
        <Tooltip title={errMsg}>
          <Icon
            type="info"
            style={{
              color: 'rgb(247, 103, 118)',
            }}
          />
        </Tooltip>
        )}
      </>
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
    if (record.get('deployMode') === 'env' && !value) {
      return '';
    }
    return (
      <Tooltip title={value || ''}>
        <span
          className={`${prefixCls}-content-table-instance`}
          onClick={() => linkToInstance(record)}
        >
          {value || ''}
        </span>
      </Tooltip>
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
      <span className="c7ncd-deploy-content-deployType">
        <StatusTag
          color={deployMode === 'host' ? 'rgb(142, 187, 252)' : 'rgb(116, 217, 221)'}
          name={deployMode === 'host' ? '主机' : '环境'}
          style={statusTagsStyle}
        />
        <Tooltip title={deployPayloadName}>
          <span className="c7ncd-deploy-content-deployType-name">
            {deployPayloadName}
          </span>
        </Tooltip>
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

  const renderDeploySource = useCallback(({ value, record }) => {
    const {
      type, marketAppName, marketServiceName, projectName,
    } = value || {};
    if (!type) {
      return null;
    }
    const hasMarketInfo = type === 'market' && marketServiceName;
    return (
      <>
        <div className={`${prefixCls}-content-source-wrap`}>
          <span className={`${prefixCls}-content-source`}>
            {formatMessage({ id: `${intlPrefix}.source.deploy.${type}` })}
          </span>
          {type === 'share' && (
            <Tooltip title={projectName} placement="top">
              <span className={`${prefixCls}-content-source-text`}>{projectName}</span>
            </Tooltip>
          )}
          {hasMarketInfo && (
            <Tooltip title={marketAppName} placement="top">
              <span className={`${prefixCls}-content-source-text`}>{marketAppName}</span>
            </Tooltip>
          )}
        </div>
        {hasMarketInfo && (
          <div className={`${prefixCls}-content-source-market`}>
            <span>
              {formatMessage({ id: `${intlPrefix}.marketService` })}
              :&nbsp;
            </span>
            <Tooltip title={marketServiceName}>
              <span>{marketServiceName}</span>
            </Tooltip>
          </div>
        )}
      </>
    );
  }, []);

  const openCommandModal = useCallback((log) => {
    Modal.open({
      key: commandModalKey,
      title: '查看指令',
      style: { width: SMALL },
      children: <ReactCodeMirror
        value={log || ''}
        options={logOptions}
        className={`${prefixCls}-content-command`}
      />,
      okText: formatMessage({ id: 'close' }),
      okCancel: false,
      drawer: true,
    });
  }, []);

  const renderAction = useCallback(({ record }) => {
    if (record.get('log')) {
      return (
        <Action data={[{
          text: '查看指令',
          action: () => openCommandModal(record.get('log')),
        }]}
        />
      );
    }
    return null;
  }, []);

  return (
    <Page
      service={['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.default']}
    >
      <Header title={<FormattedMessage id="app.head" />} backPath={getBackPath()}>
        <HeaderButtons
          items={([
            {
              name: formatMessage({ id: `${intlPrefix}.manual` }),
              icon: 'cloud_done-o',
              display: true,
              permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.manual'],
              handler: openDeploy,
            },
            {
              name: formatMessage({ id: `${intlPrefix}.batch` }),
              icon: 'cloud_done-o',
              display: true,
              permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.batch'],
              handler: openBatchDeploy,
            },
            {
              name: '基础组件部署',
              icon: 'cloud_done-o',
              display: HAS_BASE_PRO,
              permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.basedComponent'],
              handler: () => openBaseDeploy(),
            },
            {
              icon: 'refresh',
              display: true,
              handler: refresh,
            },
          ])}
          showClassName={false}
        />
      </Header>
      <Breadcrumb />
      <Content className={`${prefixCls}-content`}>
        <Table
          dataSet={listDs}
          className={`${prefixCls}-content-table`}
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
          <Column renderer={renderAction} width={60} />
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
            width={90}
          />
          <Column name="instanceName" renderer={renderInstance} />
          <Column name="deploySourceVO" renderer={renderDeploySource} />
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
          <Column name="executeUser" renderer={renderExecutor} />
        </Table>
      </Content>
    </Page>
  );
}));

export default Deployment;
