import React, { useMemo } from 'react';
import { HeaderButtons } from '@choerodon/master';
import { useAppDetailTabsStore } from '../../stores';
import { openModifyValueModal } from './modal';
import { useAppDetailsStore } from '../../../../stores';

const DetailsTabsHeaderButtons = () => {
  const {
    refresh,
  } = useAppDetailTabsStore();

  const {
    appDs,
    appId: appCenterId,
    deployTypeId: hostOrEnvId,
    deployType,
  } = useAppDetailsStore();

  const appRecord = appDs.current;

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
        },
        {
          name: '创建域名',
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
            appServiceVersionId: appRecord?.get('effectCommandId'),
            appServiceId: appRecord?.get('appServiceId'),
            instanceId: appCenterId,
            isMarket: appRecord?.get('chartSource') === 'market',
            isMiddleware: appRecord?.get('chartSource') === 'middleware',
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
  ]), [refresh]);

  return <HeaderButtons showClassName items={headerBtnsItems} />;
};

export default DetailsTabsHeaderButtons;
