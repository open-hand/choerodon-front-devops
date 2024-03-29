import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderButtons, useFormatMessage } from '@choerodon/master';
import { useResourceStore } from '../../../../stores';
import { useIstListStore } from '../stores';
import { openBatchDeploy } from '@/components/batch-deploy';
import { openAppCreateModal } from '@/components/open-appCreate';

const CustomModals = observer(() => {
  const {
    resourceStore: {
      getSelectedMenu: { parentId },
      getSelectedMenu,
      setSelectedMenu, setExpandedKeys,
    },
    treeDs,
    formatMessage,
    itemTypes,
  } = useResourceStore();

  const format = useFormatMessage('c7ncd.resource');

  const {
    istListDs,
    envId,
  } = useIstListStore();

  function refresh() {
    treeDs.query();
    istListDs.query();
  }

  async function handleCreateCallback(type) {
    let menuData = {};
    switch (type) {
      case 'deployGroup':
        menuData = {
          id: 1,
          name: formatMessage({ id: 'workload_group' }),
          key: `${parentId}**workload`,
          isGroup: true,
          expand: false,
          itemType: `${itemTypes.WORKLOAD_GROUP}`,
          parentId: String(parentId),
        };
        break;
      case 'chart':
        menuData = {
          id: 0,
          name: formatMessage({ id: 'instances_group' }),
          key: `${parentId}**instances`,
          isGroup: true,
          expand: false,
          itemType: `${itemTypes.IST_GROUP}`,
          parentId: String(parentId),
        };
        break;
      default:
        break;
    }
    await refresh();
    setSelectedMenu(menuData);
    setExpandedKeys([`${parentId}`]);
  }

  const buttons = useMemo(() => {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord && envRecord.get('connect');
    const configDisabled = !connect;
    return [
      {
        permissions: [],
        disabled: configDisabled,
        name: format({ id: 'CreateApplication' }),
        icon: 'playlist_add',
        handler: () => openAppCreateModal(handleCreateCallback, true, envId),
      },
      {
        icon: 'refresh',
        handler: refresh,
      },
    ];
  }, [envId, parentId, refresh, treeDs]);

  return <HeaderButtons items={buttons} showClassName />;
});

export default CustomModals;
