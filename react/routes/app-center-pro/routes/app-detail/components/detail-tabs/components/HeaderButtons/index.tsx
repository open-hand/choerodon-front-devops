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
  } = useAppDetailsStore();

  const appRecord = appDs.current;

  const {
    appServiceVersionId,
    appServiceId,
    instanceId,
    chartSource,
    commandVersion,
  } = appRecord?.toData() || {};

  const isMarket = chartSource === 'market';

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
        },
        {
          name: '停用应用',
          // icon: 'do_not_disturb_alt',
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
  ]), [appServiceId, appServiceVersionId, hostOrEnvId, instanceId, isMarket, isMiddleware, refresh]);

  return <HeaderButtons showClassName items={headerBtnsItems} />;
};

export default observer(DetailsTabsHeaderButtons);
