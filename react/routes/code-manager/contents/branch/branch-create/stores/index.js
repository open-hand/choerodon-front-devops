import React, {
  createContext, useContext, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import CreateDataSet from './BranchCreateDataSet';
import useStore from './useStore';
import ProjectOptionsDataSet from '../../branch-edit/stores/ProjectOptionsDataSet';

const Store = createContext();

export function useFormStore() {
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
      children,
      appServiceId,
      intlPrefix,
    } = props;
    const currentProjectData = useMemo(() => ({
      id: projectId,
      name: projectName,
    }), [projectId, projectName]);

    const contentStore = useStore();
    const projectOptionsDs = useMemo(() => new DataSet(ProjectOptionsDataSet({
      organizationId, userId: getUserId, projectId,
    })), [organizationId]);
    const formDs = useMemo(() => new DataSet(CreateDataSet({
      formatMessage,
      projectId,
      appServiceId,
      contentStore,
      projectOptionsDs,
      currentProjectData,
    }), [projectId, appServiceId]));

    const value = {
      ...props,
      projectId,
      appServiceId,
      contentStore,
      formDs,
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
