import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import useStore, { StoreProps } from '@/routes/resource/main-view/contents/workload/stores/useStore';
import TableDataSet from '@/routes/resource/main-view/contents/workload/stores/TableDataSet';
import { DataSet as DataSetProps, DataSetSelection } from '@/interface';
import { useResourceStore } from '../../../../stores';

interface ContentProps {
  workloadStore: StoreProps
  tabs: {
    DEPLOYMENT_TAB: 'Deployment',
    DAEMONSET_TAB: 'DaemonSet',
    STATEFULSET: 'StatefulSet',
    JOB_TAB: 'Job',
    CRONJOB_TAB: 'CronJob',
  },
  tableDs: DataSetProps,
}

const Store = createContext({} as ContentProps);

export function useWorkloadStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(observer((props: any) => {
  const { children, intl: { formatMessage } } = props;
  const {
    AppState: { currentMenuType: { id: projectId } },
    resourceStore,
    intlPrefix,
  } = useResourceStore();
  const {
    getSelectedMenu: { parentId },
  } = resourceStore;
  const tabs = useMemo(() => ({
    DEPLOYMENT_TAB: 'Deployment',
    DAEMONSET_TAB: 'DaemonSet',
    STATEFULSET: 'StatefulSet',
    JOB_TAB: 'Job',
    CRONJOB_TAB: 'CronJob',
  }), []);

  const workloadStore = useStore(tabs);
  const resourceDs = useMemo(() => new DataSet({
    data: [{
      text: formatMessage({ id: `${intlPrefix}.workload.resource.deploy` }),
      value: 'deploy',
    }, {
      text: formatMessage({ id: `${intlPrefix}.workload.resource.manual` }),
      value: 'manual',
    }],
    selection: 'single' as DataSetSelection,
  }), []);
  const tableDs = useMemo(() => new DataSet(TableDataSet({
    formatMessage, projectId, intlPrefix, resourceDs,
  })), [projectId]);

  useEffect(() => {
    // if (parentId) {
    //   tableDs.setQueryParameter('envId', parentId);
    //   tableDs.query();
    // }
  }, [parentId]);

  const value = {
    ...props,
    tabs,
    workloadStore,
    tableDs,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
