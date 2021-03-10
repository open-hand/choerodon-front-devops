import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import copyPipelineDataSet from '@/routes/pipeline-manage/components/PipelineTree/stores/copyPipelineDataSet';
import useStore from './useStore';
import appServiceDataset from './appServiceDataset';

const Store = createContext();

export function usePipelineTreeStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props) => {
  const {
    AppState: { currentMenuType: { projectId } },
    intl: { formatMessage },
    children,
  } = props;

  const treeStore = useStore();

  const seletDs = useMemo(() => new DataSet(appServiceDataset(projectId)), [projectId]);

  const CopyPipelineDataSet = useMemo(
    () => new DataSet(copyPipelineDataSet(seletDs)), [seletDs],
  );

  const value = {
    ...props,
    treeStore,
    CopyPipelineDataSet,
    seletDs,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
