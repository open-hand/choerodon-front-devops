/* eslint-disable max-len */
import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import ResourceCountDataSet from './ResourceCountDataSet';
import { useResourceStore } from '../../../../stores';
import { useMainStore } from '../../../stores';
import GitopsLogDataSet from './GitopsLogDataSet';
import GitopsSyncDataSet from './GitopsSyncDataSet';
import RetryDataSet from './RetryDataSet';
import PermissionsDataSet from './PermissionsDataSet';
import useStore from './useStore';
import ConfigDataSet from './ConfigDataSet';
import SummaryDataSet from './SummaryDataSet';
import PolarisNumDataSet from './PalarisNumDataSet';

type ContextProps = {
  [fields:string]:any
}

const Store = createContext({} as ContextProps);

export function useREStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props:any) => {
    const {
      AppState: { currentMenuType: { id: projectId, organizationId } },
      intl: { formatMessage },
      children,
    } = props;

    const { resourceStore: { getSelectedMenu: { id, name } }, intlPrefix, treeDs } = useResourceStore();

    const {
      baseInfoDs, mainStore, key,
    } = useMainStore();

    const tabs = useMemo(() => ({
      SYNC_TAB: 'sync',
      CONFIG_TAB: 'config',
      ASSIGN_TAB: 'assign',
      POLARIS_TAB: 'polaris',
    }), []);

    const envStore = useStore({ defaultTab: tabs.SYNC_TAB });

    const {
      getTabKey: currentTabKey,
    } = envStore;

    // Permission相关
    const permissionsDs = useMemo(() => new DataSet(PermissionsDataSet({
      formatMessage, intlPrefix, id, baseInfoDs,
    })), [id, baseInfoDs]);

    const resourceCountDs = useMemo(() => new DataSet(ResourceCountDataSet({ id })), [id]);

    const gitopsLogDs = useMemo(() => new DataSet(GitopsLogDataSet({
      formatMessage,
      intlPrefix,
      id,
    })), [id]);
    const gitopsSyncDs = useMemo(() => new DataSet(GitopsSyncDataSet(id)), [id]);
    const retryDs = useMemo(() => new DataSet(RetryDataSet(id)), [id]);

    const configDs = useMemo(() => new DataSet(ConfigDataSet({ formatMessage, intlPrefix, id })), [id]);

    const polarisNumDS = useMemo(() => new DataSet(PolarisNumDataSet(id)), [id]);
    const istSummaryDs = useMemo(() => new DataSet(SummaryDataSet(id)), [id]);

    async function loadPolaris() {
      const res = await envStore.checkHasInstance(projectId, id);
      if (res) {
        polarisNumDS.query();
        istSummaryDs.query();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function loadTabData() {
      switch (currentTabKey) {
        case tabs.SYNC_TAB:
          gitopsSyncDs.query();
          gitopsLogDs.query();
          break;
        case tabs.CONFIG_TAB:
          configDs.query();
          break;
        case tabs.ASSIGN_TAB:
          permissionsDs.query();
          break;
        case tabs.POLARIS_TAB:
          polarisNumDS.removeAll();
          istSummaryDs.removeAll();
          loadPolaris();
          break;
        default:
      }
    }

    function refresh() {
      baseInfoDs.query();
      resourceCountDs.query();
      treeDs.query();
      loadTabData();
    }

    useEffect(() => {
      loadTabData();
    }, [projectId, id, envStore.getTabKey]);

    useEffect(() => {
      envStore.checkPermission({ projectId, organizationId });
    }, [projectId, organizationId]);

    const value = {
      ...props,
      envStore,
      tabs,

      baseInfoDs,
      resourceCountDs,

      gitopsLogDs,
      gitopsSyncDs,
      retryDs,

      // permission相关
      permissionsDs,

      configDs,

      polarisNumDS,
      istSummaryDs,

      loadTabData,
      refresh,

      mainStore,
      key,
      projectId,
      name,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
