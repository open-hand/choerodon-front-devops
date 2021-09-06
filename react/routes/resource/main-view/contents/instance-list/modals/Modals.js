import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderButtons } from '@choerodon/master';
import { useResourceStore } from '../../../../stores';
import { useIstListStore } from '../stores';
import { openBatchDeploy } from '@/components/batch-deploy';
import { openAppCreateModal } from '@/components/open-appCreate';

const CustomModals = observer(() => {
  const {
    resourceStore: {
      getSelectedMenu: { parentId },
    },
    treeDs,
  } = useResourceStore();

  const {
    istListDs,
    envId,
  } = useIstListStore();

  function refresh() {
    treeDs.query();
    istListDs.query();
  }

  const buttons = useMemo(() => {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord && envRecord.get('connect');
    const configDisabled = !connect;
    return [
      {
        permissions: [],
        disabled: configDisabled,
        name: '创建应用',
        icon: 'playlist_add',
        handler: () => openAppCreateModal(refresh, true, envId),
      },
      {
        permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.resource-batch'],
        disabled: configDisabled,
        name: '批量创建Chart应用',
        icon: 'library_add-o',
        handler: () => openBatchDeploy({
          envId,
          refresh,
        }),
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
