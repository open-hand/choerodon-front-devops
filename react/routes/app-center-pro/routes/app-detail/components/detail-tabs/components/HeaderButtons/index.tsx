/* eslint-disable max-len */
import React, { useMemo } from 'react';
import { HeaderButtons } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { useAppDetailTabsStore } from '../../stores';
import { openModifyValueModal } from './components/modify-values';
import { useAppDetailsStore } from '../../../../stores';
import { openNetWorkFormModal } from './components/create-network';
import { openDomainFormModal } from './components/domain-form';
import { openRedeploy } from './components/reDeploy';
import { openChangeActive } from './components/app-status-toggle';
import { openMarketUpgradeModal } from './components/app-upgrade';

const DetailsTabsHeaderButtons = () => {
  const {
    refresh,
    projectId,
  } = useAppDetailTabsStore();

  const {
    appDs,
    appId: appCenterId,
    deployTypeId: hostOrEnvId,
    deployType,
    status: appStatus,
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
  } = appRecord?.toData() || {};

  const isMarket = chartSource === 'market' || chartSource === 'hzero';

  const isMiddleware = chartSource === 'middleware';

  const headerBtnsItems = useMemo(() => ([
    {
      name: '修改应用（jar包）',
    },
    {
      name: '修改应用（Chart包）',
    },
    {
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
    },
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
    },
    {
      name: '更多操作',
      groupBtnItems: [
        {
          name: '修改Values',
          // icon: 'rate_review1',
          handler: () => openModifyValueModal({
            appServiceVersionId,
            appServiceId,
            instanceId,
            isMarket,
            isMiddleware,
            envId: hostOrEnvId,
          }),
        },
        {
          name: '升级',
          // icon: 'rate_review1',
          handler: () => openMarketUpgradeModal({
            instanceId,
            appServiceId,
            appServiceName,
            envId: hostOrEnvId,
            appServiceVersionId,
            callback: refresh,
            isMiddleware,
          }),
        },
        {
          name: '重新部署',
          // icon: 'redeploy_line',
          handler: () => openRedeploy({
            appServiceId,
            commandVersion,
            projectId,
            refresh,
          }),
        },
        {
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
        },
        {
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
        },
        {
          name: '删除应用',
          // icon: 'delete_forever-o',
        },
      ],
    },
    {
      icon: 'refresh',
      iconOnly: true,
      handler: refresh,
    },
  ]), [appServiceId, appServiceVersionId, commandVersion, hostOrEnvId, instanceId, isMarket, isMiddleware, projectId, refresh]);

  return <HeaderButtons showClassName items={headerBtnsItems} />;
};

export default observer(DetailsTabsHeaderButtons);
