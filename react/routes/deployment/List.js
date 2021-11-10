/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, max-len */
import React, { useCallback, useEffect, Suspense } from 'react';
import {
  Page,
  Content,
  Header,
  Permission,
  Breadcrumb,
  Choerodon,
  HeaderButtons,
  Action,
  TabCode,
} from '@choerodon/master';
import {
  Table, Modal, Select, Icon, Tooltip,
} from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { get, has } from '@choerodon/inject';
import { observer } from 'mobx-react-lite';
import { StatusTag, NewTips as Tips } from '@choerodon/components';

import ReactCodeMirror from 'react-codemirror';
import app from '@/images/app.svg';
import image from '@/images/image.svg';
import jar from '@/images/jar.svg';
import hzero from '@/images/hzero.svg';
import { SMALL, MIDDLE } from '@/utils/getModalWidth';
import { mapping } from './stores/ListDataSet';
import { useDeployStore } from './stores';
import TimePopover from '../../components/timePopover/TimePopover';
import UserInfo from '../../components/userInfo';
import Deploy from './modals/deploy';
import BaseComDeploy from './modals/base-comDeploy';
import HzeroDeploy from './modals/hzero-deploy';
import { openBatchDeploy } from '@/components/batch-deploy';
import { openAppCreateModal } from '@/components/open-appCreate';
import HzeroDeployDetail from './modals/hzero-deploy-detail';
import { LARGE } from '../../utils/getModalWidth';
import { deployRecordApi } from '../../api';
import { getHzeroDeployBtnConfig } from '@/components/hzero-deploy';
// import ConfigurationModal from '@/components/configuration-center/ConfigurationModal';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import './index.less';

const { Column } = Table;
const modalKey4 = Modal.key();
const commandModalKey = Modal.key();
const hzeroDeployModalKey = Modal.key();
const hzeroDeployDetailModalKey = Modal.key();
const hzeroStopModalKey = Modal.key();
const ConfigurationModalKey = Modal.key();
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

const Deployment = withRouter(
  observer((props) => {
    const {
      intl: { formatMessage },
      AppState: {
        currentMenuType: { id, projectId },
      },
      intlPrefix,
      prefixCls,
      listDs,
      deployStore,
      hasMarket,
    //   configurationDetailDataSet,
    } = useDeployStore();

    useEffect(() => {
      const {
        location: { search },
      } = props;
      const urlQuery = new URLSearchParams(search);
      if (urlQuery.get('mode') || urlQuery.get('deployType')) {
        has('base-pro:getBaseComponentDeployConfig')
          && get('base-pro:getBaseComponentDeployConfig')(refresh, true)(
            urlQuery.get('mode'),
            urlQuery.get('deployType'),
          );
        // openBaseDeploy();
        urlQuery.delete('mode');
        urlQuery.delete('deployType');
        window.history.replaceState(
          null,
          null,
          `/#/devops/deployment-operation?${urlQuery.toString()}`,
        );
      }
    }, []);

    function refresh() {
      listDs.query();
    }

    const getStatusTag = useCallback(
      (status) => (
        <StatusTag
          colorCode={status || ''}
          name={status ? formatMessage({ id: `${intlPrefix}.status.${status}` }) : 'unKnow'}
          style={statusTagsStyle}
        />
      ),
      [],
    );

    function openDeploy() {
      Modal.open({
        key: modalKey4,
        style: modalStyle2,
        drawer: true,
        title: formatMessage({ id: `${intlPrefix}.manual` }),
        children: (
          <Deploy
            deployStore={deployStore}
            refresh={deployAfter}
            intlPrefix={intlPrefix}
            prefixCls={prefixCls}
            hasHostDeploy
            random={Math.random()}
          />
        ),
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
        children: (
          <BaseComDeploy
            random={Math.random()}
            {...(deployWay
              ? {
                deployWay,
              }
              : {})}
            {...(middleware
              ? {
                middleware,
              }
              : {})}
            refresh
          />
        ),
        okText: '部署',
      });
    }

    function linkToInstance(record) {
      const {
        history,
        location: { search },
      } = props;
      if (record) {
        const instanceId = record.get('instanceId');
        const appServiceId = record.get('appServiceId');
        const envId = record.get('envId');
        history.push({
          pathname: '/devops/resource',
          search: `${search}`,
          state: {
            instanceId,
            appServiceId,
            envId,
          },
        });
      } else {
        history.push(`/devops/resource${search}`);
      }
    }

    function deployAfter(instance, type = 'instance') {
      const {
        history,
        location: { search },
      } = props;
      if (instance.config) {
        refresh();
      } else {
        history.push({
          pathname: '/devops/resource',
          search: `${search}`,
          state: {
            instanceId: instance.id,
            appServiceId: instance.appServiceId,
            envId: instance.envId,
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
            className={`${prefixCls}-content-table-mark ${prefixCls}-content-table-mark-${type}`}
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
          {getStatusTag(value)}
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
      const {
        location: { state },
      } = props;
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
            <span className="c7ncd-deploy-content-deployType-name">{deployPayloadName}</span>
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
        hzero: {
          img: hzero,
          text: 'Hzero应用',
        },
      };
      return [
        <p className="c7ncd-deploy-content-deployObjectP">
          <Tooltip title={iconMap[deployObjectType]?.text}>
            <img src={iconMap[deployObjectType]?.img} alt="" />
          </Tooltip>
          <span className="c7ncd-deploy-content-deployObjectName">{deployObjectName}</span>
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
        children: (
          <ReactCodeMirror
            value={log || ''}
            options={logOptions}
            className={`${prefixCls}-content-command`}
          />
        ),
        okText: formatMessage({ id: 'close' }),
        okCancel: false,
        drawer: true,
      });
    }, []);

    // const openConfigurationModal = (deployId) => {
    //   Modal.open({
    //     key: ConfigurationModalKey,
    //     title: '配置文件详情',
    //     style: { width: MIDDLE },
    //     children: (
    //       <ConfigurationModal
    //         type="modal"
    //         kind="deploy"
    //         id={deployId}
    //         configurationDetailDataSet={configurationDetailDataSet}
    //       />
    //     ),
    //     okText: formatMessage({ id: 'close' }),
    //     okCancel: false,
    //     drawer: true,
    //   });
    // };

    const handleHzeroRetry = useCallback(async (record) => {
      try {
        await deployRecordApi.retryRecord(record.get('id'));
        refresh();
        return true;
      } catch (e) {
        return false;
      }
    }, []);

    const openHzeroStopModal = useCallback((record) => {
      Modal.open({
        key: hzeroStopModalKey,
        title: formatMessage({ id: `${intlPrefix}.hzero.stop.title` }),
        children: formatMessage({ id: `${intlPrefix}.hzero.stop.des` }),
        okText: formatMessage({ id: `${intlPrefix}.stop` }),
        onOk: () => handleHzeroStop(record.get('id')),
      });
    }, []);

    const handleHzeroStop = useCallback(async (recordId) => {
      try {
        await deployRecordApi.stopRecord(recordId);
        refresh();
        return true;
      } catch (e) {
        return false;
      }
    }, []);

    const openHzeroDeployDetailModal = useCallback((record) => {
      Modal.open({
        key: hzeroDeployDetailModalKey,
        title: (
          <div>
            <span style={{ paddingRight: '0.12rem' }}>
              记录“#
              {record.get('viewId')}
              ”的执行详情
            </span>
            {getStatusTag(record.get('deployResult'))}
          </div>
        ),
        style: { width: LARGE },
        children: (
          <HzeroDeployDetail
            status={record.get('deployResult')}
            recordId={record.get('id')}
            refresh
            handleHzeroStop={handleHzeroStop}
          />
        ),
        okText: formatMessage({ id: 'close' }),
        okCancel: false,
        drawer: true,
      });
    }, []);

    const renderAction = useCallback(({ record }) => {
      if (record.get('deployType') === 'hzero') {
        const actionData = [
          {
            service: [
              'choerodon.code.project.deploy.app-deployment.deployment-operation.ps.hzero.detail',
            ],
            text: formatMessage({ id: `${intlPrefix}.record.detail` }),
            action: () => openHzeroDeployDetailModal(record),
          },
        ];
        switch (record.get('deployResult')) {
          case 'canceled':
          case 'failed':
            actionData.push({
              service: [
                'choerodon.code.project.deploy.app-deployment.deployment-operation.ps.hzero.retry',
              ],
              text: formatMessage({ id: `${intlPrefix}.retry` }),
              action: () => handleHzeroRetry(record),
            });
            break;
          case 'operating':
            actionData.push({
              service: [
                'choerodon.code.project.deploy.app-deployment.deployment-operation.ps.hzero.stop',
              ],
              text: formatMessage({ id: `${intlPrefix}.hzero.stop` }),
              action: () => openHzeroStopModal(record),
            });
          // eslint-disable-next-line no-fallthrough
          default:
        }
        return <Action data={actionData} />;
      }
      if (record.get('log')) {
        return (
          <Action
            data={[
              {
                text: '查看指令',
                action: () => openCommandModal(record.get('log')),
              },
            ]}
          />
        );
      }
      //   if (record.get('deployMode') === 'host' && record.get('deployType') !== 'baseComponent') {
      //     return (
      //       <Action
      //         data={[
      //           {
      //             text: '查看配置文件',
      //             action: () => openConfigurationModal(record.get('id')),
      //           },
      //         ]}
      //       />
      //     );
      //   }
      return null;
    }, []);

    const getHeaderButtons = () => {
      const res = [
        {
          name: '创建应用',
          icon: 'playlist_add',
          display: true,
          permissions: [
            'choerodon.code.project.deploy.app-deployment.deployment-operation.ps.manual',
          ],
          handler: () => openAppCreateModal(refresh),
        },
        {
          name: '批量创建Chart应用',
          icon: 'library_add-o',
          display: true,
          permissions: [
            'choerodon.code.project.deploy.app-deployment.deployment-operation.ps.batch',
          ],
          handler: () => openBatchDeploy({
            refresh: deployAfter,
          }),
        },
        {
          icon: 'refresh',
          display: true,
          handler: refresh,
        },
      ];
      if (deployStore.getHzeroSyncStatus) {
        res.unshift(
          getHzeroDeployBtnConfig({
            refresh,
            syncStatus: deployStore.getHzeroSyncStatus,
            hasMarket,
          }),
        );
      }
      if (has('base-pro:getBaseComponentDeployConfig')) {
        res.splice(2, 0, {
          ...get('base-pro:getBaseComponentDeployConfig')(refresh, false),
        });
      }

      return <HeaderButtons items={res} showClassName={false} />;
    };

    return (
      <Page
        service={['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.default']}
      >
        <Header title={<FormattedMessage id="app.head" />} backPath={getBackPath()}>
          {getHeaderButtons()}
        </Header>
        <Breadcrumb />
        <Content className={`${prefixCls}-content`}>
          <Table dataSet={listDs} className={`${prefixCls}-content-table`} rowHeight="auto">
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
              header={<Tips helpText="部署方式分为：主机部署与环境部署" title="部署方式&载体" />}
              name={mapping.deployMethod.value}
              renderer={renderDeployMethod}
            />
            <Column
              name="deployResult"
              renderer={renderDeployStatus}
              header="执行结果"
              width={90}
            />
            <Column name="appName" renderer={renderInstance} />
            <Column name="deploySourceVO" renderer={renderDeploySource} />
            <Column
              name={mapping.deployObject.value}
              renderer={renderDeployObejct}
              header={
                <Tips helpText="部署对象分为：应用服务、jar包与Docker镜像" title="部署对象" />
              }
            />
            <Column name="executeUser" renderer={renderExecutor} />
          </Table>
        </Content>
      </Page>
    );
  }),
);

export default Deployment;
