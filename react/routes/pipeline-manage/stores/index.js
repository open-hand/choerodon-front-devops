import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet, Modal } from 'choerodon-ui/pro';

import useStore from './useStore';
import useEditBlockStore from './useEditBlockStore';
import useDetailStore from './useDetailStore';
import TreeDataSet from './TreeDataSet';

const HEIGHT = window.innerHeight || document.documentElement.clientHeight
  || document.body.clientHeight;

const Store = createContext();

export function usePipelineManageStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props) => {
  const {
    AppState: { currentMenuType: { projectId } },
    children,
  } = props;

  const DEFAULT_SIZE = HEIGHT > 900 ? 20 : 12;

  function handleSelect(record, store, editBlockStore, previous) {
    if (record) {
      const data = record.toData();
      store.setSelectedMenu(data);
    }
  }

  const mainStore = useStore({ DEFAULT_SIZE });
  const editBlockStore = useEditBlockStore(mainStore);
  const detailStore = useDetailStore(mainStore);
  const treeDs = useMemo(() => new DataSet(TreeDataSet({
    projectId, mainStore, editBlockStore, handleSelect, DEFAULT_SIZE,
  })), [projectId]);

  useEffect(() => {
    // 处理消息铃铛中审核任务的跳转
    const pattern = new URLSearchParams(window.location.hash);
    const newPipelineId = pattern.get('pipelineId');
    const newPipelineIdRecordId = pattern.get('pipelineIdRecordId');

    if (newPipelineId && newPipelineIdRecordId) {
      mainStore.setSelectedMenu({
        key: `${newPipelineId}-${newPipelineIdRecordId}`,
        parentId: newPipelineId,
        devopsPipelineRecordRelId: newPipelineIdRecordId,
      });
      mainStore.setExpandedKeys([newPipelineId]);
    }
    treeDs.query();
  }, []);

  const value = {
    ...props,
    prefixCls: 'c7ncd-pipelineManage',
    intlPrefix: 'c7ncd.pipelineManage',
    permissions: [
      'choerodon.code.project.develop.ci-pipeline.ps.default',
    ],
    mainStore,
    treeDs,
    detailStore,
    editBlockStore,
    projectId,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
