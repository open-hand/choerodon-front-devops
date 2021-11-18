import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import SelectDataSet from './SelectDataSet';
import variableDataSet from './variableDataSet';
import useStore from './useStore';

const Store = createContext();

export function useExecuteContentStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')((props) => {
  const {
    AppState: { currentMenuType: { projectId } },
    intl: { formatMessage },
    children,
    appServiceId,
    gitlabProjectId,
    pipelineId,
    appServiceName,
  } = props;

  const store = useStore();
  const VariableDataSet = useMemo(() => new DataSet(variableDataSet()), []);
  const selectDs = useMemo(() => new DataSet(SelectDataSet({
    projectId, formatMessage, gitlabProjectId, pipelineId, appServiceName, VariableDataSet,
  })), [projectId, gitlabProjectId, pipelineId]);

  const value = {
    ...props,
    selectDs,
    store,
    VariableDataSet,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
