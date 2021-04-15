import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import SelectDataSet from './SelectDataSet';
import ProjectOptionsDataSet from './ProjectOptionsDataSet';

const Store = createContext();

export function useSelectStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props) => {
    const {
      AppState: {
        currentMenuType: { id: projectId, organizationId, name: projectName },
        getUserId,
      },
      intl: { formatMessage },
      issueId,
      branchName,
      appServiceId,
      objectVersionNumber,
      children,
      intlPrefix,
      initIssue,
      initProject,
    } = props;

    const currentProjectData = useMemo(() => (initProject ?? {
      id: projectId,
      name: projectName,
    }), [projectId, projectName, initProject]);

    const projectOptionsDs = useMemo(() => new DataSet(ProjectOptionsDataSet({
      organizationId, userId: getUserId, projectId,
    })), [organizationId]);
    const selectDs = useMemo(() => new DataSet(SelectDataSet({
      projectId,
      issueId,
      formatMessage,
      appServiceId,
      objectVersionNumber,
      branchName,
      projectOptionsDs,
      currentProjectData,
    }), [projectId]));

    useEffect(() => {
      issueId && selectDs.current.init('issue', initIssue);
    }, []);

    const value = {
      ...props,
      prefixCls: 'c7ncd-branch-edit',
      appServiceId,
      selectDs,
      formatMessage,
      intlPrefix,
      projectOptionsDs,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
