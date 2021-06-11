import React, { useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import { Record } from '@/interface';
import { useWorkloadStore } from '@/routes/resource/main-view/contents/workload/stores';
import { LARGE } from '@/utils/getModalWidth';
import { useResourceStore } from '../../../../stores';
import CreateWorkloadContent from './create-workload';

const createModalKey = Modal.key();

const CustomModals = observer(() => {
  const {
    intl: { formatMessage },
    resourceStore: {
      getSelectedMenu: { parentId },
    },
    treeDs,
    intlPrefix,
    resourceStore,
    prefixCls,
  } = useResourceStore();
  const {
    tableDs,
    workloadStore,
  } = useWorkloadStore();

  const title = useMemo(() => (
    formatMessage({ id: `${intlPrefix}.workload.create` }, { name: workloadStore.getTabKey })
  ), [workloadStore.getTabKey]);

  const refresh = useCallback(() => {
    // treeDs.query();
    tableDs.query();
  }, []);

  const openCreateModal = useCallback(() => {
    const envRecord = treeDs.find((record: Record) => record.get('key') === parentId);
    const envName = envRecord && envRecord.get('name');
    Modal.open({
      key: createModalKey,
      style: {
        width: LARGE,
      },
      drawer: true,
      title,
      children: <CreateWorkloadContent
        resourceStore={resourceStore}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        refresh={refresh}
        envName={envName}
        workloadType={workloadStore.getTabKey}
      />,
      okText: formatMessage({ id: 'create' }),
    });
  }, [workloadStore.getTabKey]);

  const buttons = useMemo(() => {
    const envRecord = treeDs.find((record: Record) => record.get('key') === parentId);
    const connect = envRecord && envRecord.get('connect');
    const configDisabled = !connect;
    return [{
      permissions: [],
      disabled: configDisabled,
      name: title,
      icon: 'playlist_add',
      handler: openCreateModal,
      display: true,
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
    }];
  }, [formatMessage, refresh, title, parentId]);

  return <HeaderButtons items={buttons} showClassName />;
});

export default CustomModals;
