import React, { createContext, useContext, useMemo } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import pipelineCreateFormDataSet from './pipelineCreateFormDataSet';
import appServiceOptionsDs from './appServiceOptionsDs';
import useStore from './useStore';

const Store = createContext();

export function usePipelineCreateStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props) => {
  const {
    children,
    dataSource,
    mathRandom,
    AppState: {
      menuType: {
        projectId,
      },
    },
    appService,
  } = props;

  const createUseStore = useStore();
  const AppServiceOptionsDs = useMemo(() => new DataSet(appServiceOptionsDs(projectId)), []);
  const PipelineCreateFormDataSet = useMemo(
    () => new DataSet(pipelineCreateFormDataSet(
      AppServiceOptionsDs,
      projectId,
      createUseStore,
      dataSource,
      mathRandom,
      appService,
    )), [dataSource, mathRandom],
  );

  const value = {
    ...props,
    PipelineCreateFormDataSet,
    AppServiceOptionsDs,
    createUseStore,
    projectId,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
