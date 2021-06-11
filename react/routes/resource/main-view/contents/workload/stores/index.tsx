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
  envId:string,
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
  const sourceDs = useMemo(() => new DataSet({
    data: [{
      text: formatMessage({ id: `${intlPrefix}.workload.source.deploy` }),
      value: 'true',
    }, {
      text: formatMessage({ id: `${intlPrefix}.workload.source.manual` }),
      value: 'false',
    }],
    selection: 'single' as DataSetSelection,
  }), []);
  const tableDs = useMemo(() => new DataSet(TableDataSet({
    formatMessage, projectId, intlPrefix, sourceDs,
  })), [projectId]);

  useEffect(() => {
    if (parentId) {
      tableDs.setQueryParameter('env_id', parentId);
      tableDs.query();
    }
  }, [parentId]);

  const value = {
    ...props,
    tabs,
    workloadStore,
    tableDs,
    envId: parentId,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
