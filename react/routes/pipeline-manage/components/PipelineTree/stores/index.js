import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import copyPipelineDataSet from '@/routes/pipeline-manage/components/PipelineTree/stores/copyPipelineDataSet';
import useStore from './useStore';

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

  const CopyPipelineDataSet = useMemo(
    () => new DataSet(copyPipelineDataSet(projectId)), [projectId],
  );

  const value = {
    ...props,
    treeStore,
    CopyPipelineDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
