/* eslint-disable max-len */
import { Action } from '@choerodon/master';
import React from 'react';
import { Tooltip, Button } from 'choerodon-ui/pro';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import StatusIcon from '@/components/StatusIcon';
import MouserOverWrapper from '@/components/MouseOverWrapper/MouserOverWrapper';
import { useAppDetailsStore } from '@/routes/app-center-pro/routes/app-detail/stores';
import { useAppCenterProStore } from '@/routes/app-center-pro/stores';
import { useAppDetailTabsStore } from '../../../../stores';
import { openDomainFormModal } from '@/components/domain-form';

const ConfigItemChild = (props:any) => {
  const {
    subfixCls,
    id: itemId, name, domain, error, status, pathList,
    formatMessage,
    envIsNotRunning,
    appServiceId,
  } = props;

  const {
    refresh,
  } = useAppDetailTabsStore();

  const {
    deletionStore,
  } = useAppCenterProStore();

  const {
    deployTypeId: hostOrEnvId,
  } = useAppDetailsStore();

  const buttons = [
    {
      service: [],
      text: formatMessage({ id: 'delete' }),
      action: () => {
        deletionStore.openDeleteModal({
          envId: hostOrEnvId,
          instanceId: itemId,
          callback: refresh,
          instanceName: name,
          type: 'ingress',
        });
      },
    },
    {
      service: [],
      text: formatMessage({ id: 'edit' }),
      action: () => {
        openDomainFormModal({
          envId: hostOrEnvId,
          appServiceId,
          refresh,
          ingressId: itemId,
        });
      },
    },
  ];

  const disabled = envIsNotRunning || status === 'operating';

  return (
    <div className={`${subfixCls}-resourceConfig-main`}>
      <div style={{
        minWidth: '107px',
        maxWidth: '107px',
      }}
      >
        <span>
          <StatusIcon
            name={name}
            status={status}
            error={error}
            clickAble={false}
          />
        </span>
        <span>
          域名名称
        </span>
      </div>
      <div style={{
        maxWidth: 90,
        alignItems: 'center',
      }}
      >
        {!disabled && <Action data={buttons} />}
      </div>
      <div>
        <span>
          <MouserOverWrapper text={domain} width={0.2} style={{ display: 'block' }}>
            {domain}
          </MouserOverWrapper>
        </span>
        <span>
          地址
        </span>
      </div>
      <div>
        <span style={{
          display: 'flex',
          alignItems: 'center',
        }}
        >
          <MouserOverWrapper text={pathList[0] ? pathList[0].path : ''} width={0.2}>
            {pathList[0] ? pathList[0].path : ''}
          </MouserOverWrapper>
          {pathList.length > 1 && (
          <Tooltip
            title={_.map(pathList, ({ path }:any) => <div>{path}</div>)}
          >
            <Button className={`${subfixCls}-resourceConfig-main-miniBtn`} icon="expand_more" />
          </Tooltip>
          )}
        </span>
        <span>
          路径
        </span>
      </div>
    </div>
  );
};

export default observer(ConfigItemChild);
