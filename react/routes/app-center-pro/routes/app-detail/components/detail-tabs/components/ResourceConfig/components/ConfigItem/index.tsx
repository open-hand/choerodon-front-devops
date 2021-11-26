/* eslint-disable max-len */
import React, { useState, ReactNode } from 'react';
import { Action } from '@choerodon/master';
import { Button, Tooltip, Icon } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import ConfigItemChild from '../CongfigItemChild';
import StatusIcon from '@/components/StatusIcon';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import { useAppDetailsStore } from '@/routes/app-center-pro/routes/app-detail/stores';
import { useAppDetailTabsStore } from '../../../../stores';
import { openNetWorkFormModal } from '@/components/create-network';

type Props = {
  subfixCls: string,
  data: any,
  formatMessage:any
  connect:boolean
}

const intlPrefix = 'c7ncd.deployment';

const ResourceConfigItem:React.FC<Props> = ({
  subfixCls,
  data,
  formatMessage,
  connect,
}) => {
  const {
    devopsIngressVOS,
    name,
    id: netId,
    target,
    appServiceId,
    config,
    loadBalanceIp,
    type,
    status,
    error,
  } = data;

  const {
    refresh,
  } = useAppDetailTabsStore();

  const {
    deletionStore,
  } = useAppCenterProStore();

  const {
    deployTypeId: hostOrEnvId,
  } = useAppDetailsStore();

  const [expand, setExpand] = useState<boolean>(false);

  const envIsNotRunning = !connect;

  const renderChildren = () => devopsIngressVOS?.map((value:any) => (
    <ConfigItemChild appServiceId={appServiceId} formatMessage={formatMessage} envIsNotRunning={envIsNotRunning} subfixCls={subfixCls} {...value} />
  ));

  function renderTarget() {
    const {
      instances, selectors, endPoints, targetAppServiceId, targetAppServiceName,
    } = target || {};
    const node = [];
    const port:any = [];
    const len = endPoints ? 2 : 1;
    if (targetAppServiceId && targetAppServiceName) {
      node.push(
        <div className="net-target-item">
          <span>{targetAppServiceName}</span>
        </div>,
      );
    } else if (instances && instances.length) {
      _.forEach(instances, ({ id: itemId, code, status: currentStatus }:any) => {
        const targetClass = classnames({
          'net-target-item': true,
          'net-target-item-failed': currentStatus !== 'operating' && currentStatus !== 'running',
        });
        if (code) {
          node.push(
            <div className={targetClass} key={itemId}>
              <Tooltip
                title={formatMessage({ id: currentStatus || `${intlPrefix}.application.net.deleted` })}
                placement="top"
              >
                {code}
              </Tooltip>
            </div>,
          );
        }
      });
    }
    if (!_.isEmpty(selectors)) {
      _.forEach(selectors, (value:any, key:any) => node.push(
        <div className="net-target-item" key={key}>
          <span>{key}</span>
          =
          <span>{value}</span>
        </div>,
      ));
    }
    if (endPoints) {
      const targetIps = _.split(_.keys(endPoints)[0], ',');
      const portList = _.values(endPoints)[0];
      _.map(targetIps, (item:any, index:any) => node.push(
        <div className="net-target-item" key={index}>
          <span>{item}</span>
        </div>,
      ));
      _.map(portList, (item:any, index:any) => {
        port.push(
          <div className="net-target-item" key={index}>
            <span>{item.port}</span>
          </div>,
        );
      });
    }
    return (
      <>
        {
          // eslint-disable-next-line consistent-return
          _.map([node, port], (item:any, index:any) => {
            if (item.length) {
              return (
                <div className="net-target-wrap" key={index}>
                  {item[0]}
                  {endPoints && (<div className="net-target-Ip">{item[1] || null}</div>)}
                  {item.length > len && (
                    <Popover
                      arrowPointAtCenter
                      placement="bottomRight"
                      content={<>{item}</>}
                      overlayClassName={`${subfixCls}-application-net`}
                    >
                      <Button className={`${subfixCls}-resourceConfig-main-miniBtn`} icon="expand_more" />
                    </Popover>
                  )}
                </div>
              );
            }
          })
        }
      </>
    );
  }

  const renderTargetType = () => {
    const { instances, selectors, targetAppServiceId } = target || {};

    let typeCurrent:ReactNode = 'EndPoints';
    if (targetAppServiceId) {
      typeCurrent = <FormattedMessage id="all_instance" />;
    } else if (instances && instances.length) {
      typeCurrent = <FormattedMessage id="instance" />;
    } else if (selectors) {
      typeCurrent = <FormattedMessage id="label" />;
    }
    return typeCurrent;
  };

  function renderConfigType() {
    const { externalIps, ports } = config || {};
    const iPArr:any[] = [];
    const portArr:any[] = [];
    if (externalIps && externalIps.length) {
      _.forEach(externalIps, (item:any) => (
        iPArr.push(
          <div key={item} className="net-config-item">
            {item}
          </div>,
        )
      ));
    }
    if (ports && ports.length) {
      _.forEach(ports, ({ nodePort, port, targetPort }:any) => {
        portArr.push(
          <div key={port} className="net-config-item">
            {nodePort || (type !== 'ClusterIP' && formatMessage({ id: 'null' }))}
            {' '}
            {port}
            {' '}
            {targetPort}
          </div>,
        );
      });
    }

    let content = null;
    switch (type) {
      case 'ClusterIP':
        content = (
          <>
            <div className="net-config-wrap">
              <div className="net-type-title">
                <FormattedMessage id={`${intlPrefix}.application.net.ip`} />
              </div>
              <div>{externalIps ? iPArr : '-'}</div>
            </div>
            <div className="net-config-wrap">
              <div className="net-type-title">
                <FormattedMessage id={`${intlPrefix}.application.net.port`} />
              </div>
              <div>{portArr}</div>
            </div>
          </>
        );
        break;
      case 'NodePort':
        content = (
          <>
            <div className="net-config-item">
              <FormattedMessage id={`${intlPrefix}.application.net.nport`} />
            </div>
            <div>{portArr}</div>
          </>
        );
        break;
      case 'LoadBalancer':
        content = (
          <>
            <div className="net-config-wrap">
              <div className="net-type-title">
                <FormattedMessage id={`${intlPrefix}.application.net.nport`} />
              </div>
              <div>{portArr}</div>
            </div>
            {loadBalanceIp && (
              <div className="net-config-wrap">
                <div className="net-type-title">
                  <span>LoadBalancer IP</span>
                </div>
                <div>{loadBalanceIp}</div>
              </div>
            )}
          </>
        );
        break;
      default:
        break;
    }

    return (
      <div className="net-config-content">
        <span className="net-config-type">{type}</span>
        <Tooltip
          arrowPointAtCenter
          placement="bottomRight"
          title={content}
        >
          <Button className={`${subfixCls}-resourceConfig-main-miniBtn`} icon="expand_more" />
        </Tooltip>
      </div>
    );
  }

  function renderName() {
    return (
      <StatusIcon
        className={`${subfixCls}-resourceConfig-item-name`}
        name={name}
        status={status || ''}
        error={error || ''}
        clickAble={false}
      />
    );
  }

  function renderAction() {
    const disabled = envIsNotRunning || status === 'operating';
    if (disabled) {
      return null;
    }
    const buttons = [
      {
        service: [],
        text: formatMessage({ id: 'delete' }),
        action: () => {
          deletionStore.openDeleteModal({
            envId: hostOrEnvId,
            instanceId: netId,
            callback: refresh,
            instanceName: name,
            type: 'service',
          });
        },
      },
      {
        service: [],
        text: formatMessage({ id: 'boot.edit' }),
        action: () => {
          openNetWorkFormModal({
            envId: hostOrEnvId,
            appServiceId,
            refresh,
            networkId: netId,
          });
        },
      },
    ];

    return (<Action data={buttons} />);
  }

  return (
    <div className={`${subfixCls}-resourceConfig-item`}>
      <main className={`${subfixCls}-resourceConfig-main`}>
        <div style={{
          minWidth: '130px',
          maxWidth: '130px',
        }}
        >
          {renderName()}
          <span>
            网络名称（Service）
          </span>
        </div>
        <div style={{
          maxWidth: 90,
          alignItems: 'center',
        }}
        >
          {renderAction()}
        </div>
        <div>
          <span>
            {renderTargetType()}
          </span>
          <span>
            目标对象类型
          </span>
        </div>
        <div>
          <span>
            {renderTarget()}
          </span>
          <span>
            目标对象
          </span>
        </div>
        <div>
          {renderConfigType()}
          <span>
            配置类型
          </span>
        </div>
        <div style={{
          maxWidth: 32,
          alignItems: 'flex-end',
        }}
        >
          <Button disabled={!devopsIngressVOS?.length} icon={expand ? 'expand_less' : 'expand_more'} onClick={() => setExpand(!expand)} />
        </div>
      </main>
      <footer style={{
        display: expand ? 'block' : 'none',
      }}
      >
        {renderChildren()}
      </footer>
    </div>
  );
};

export default observer(ResourceConfigItem);
