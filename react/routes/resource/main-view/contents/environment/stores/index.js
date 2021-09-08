/* eslint-disable max-len */
import React, {
  createContext, useMemo, useContext, useEffect,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import getTablePostData from '../../../../../../utils/getTablePostData';
// import PermissionsDataSet from './PermissionsDataSet';
import GitopsLogDataSet from './GitopsLogDataSet';
import GitopsSyncDataSet from './GitopsSyncDataSet';
import RetryDataSet from './RetryDataSet';
import { useResourceStore } from '../../../../stores';
import useStore from './useStore';
import ConfigDataSet from './ConfigDataSet';
import ConfigFormDataSet from './ConfigFormDataSet';
import { useMainStore } from '../../../stores';
import SummaryDataSet from './SummaryDataSet';
import PolarisNumDataSet from './PalarisNumDataSet';
import { useREStore } from '../../resource-env/stores';

const Store = createContext();

export function useEnvironmentStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  observer((props) => {
    const {
      intl: { formatMessage },
      AppState: { currentMenuType: { id: projectId, organizationId, type: resourceType } },
      children,
    } = props;

    const {
      permissionsDs,
    } = useREStore();

    const {
      intlPrefix,
      resourceStore: { getSelectedMenu: { id } },
    } = useResourceStore();

    const {
      baseInfoDs,
    } = useMainStore();

    const tabs = useMemo(() => ({
      SYNC_TAB: 'sync',
      CONFIG_TAB: 'config',
      ASSIGN_TAB: 'assign',
      POLARIS_TAB: 'polaris',
    }), []);

    const envStore = useStore({ defaultTab: tabs.SYNC_TAB });
    // const permissionsDs = useMemo(() => new DataSet(PermissionsDataSet({ formatMessage, intlPrefix })), []);
    const gitopsLogDs = useMemo(() => new DataSet(GitopsLogDataSet({ formatMessage, intlPrefix })), []);
    const gitopsSyncDs = useMemo(() => new DataSet(GitopsSyncDataSet()), []);
    const retryDs = useMemo(() => new DataSet(RetryDataSet()), []);

    const configDs = useMemo(() => new DataSet(ConfigDataSet({ formatMessage, intlPrefix })), []);

    const istSummaryDs = useMemo(() => new DataSet(SummaryDataSet()), []);
    const polarisNumDS = useMemo(() => new DataSet(PolarisNumDataSet()), []);

    function queryData() {
      const tabKey = envStore.getTabKey;
      switch (tabKey) {
        case tabs.SYNC_TAB:
          retryDs.transport.read.url = `/devops/v1/projects/${projectId}/envs/${id}/retry`;
          gitopsLogDs.transport.read.url = `/devops/v1/projects/${projectId}/envs/${id}/error_file/page_by_env`;
          gitopsSyncDs.transport.read.url = `/devops/v1/projects/${projectId}/envs/${id}/status`;
          gitopsSyncDs.query();
          gitopsLogDs.query();
          break;
        case tabs.CONFIG_TAB:
          configDs.transport.destroy = ({ data: [data] }) => ({
            url: `/devops/v1/projects/${projectId}/deploy_value?value_id=${data.id}`,
            method: 'delete',
            data: null,
          });
          configDs.transport.read = ({ data }) => {
            const postData = getTablePostData(data);
            return {
              url: `/devops/v1/projects/${projectId}/deploy_value/page_by_options?env_id=${id}`,
              method: 'post',
              data: postData,
            };
          };
          configDs.query();
          break;
        case tabs.ASSIGN_TAB:
          permissionsDs.transport.destroy = ({ data: [data] }) => ({
            url: `/devops/v1/projects/${projectId}/envs/${id}/permission?user_id=${data.iamUserId}`,
            method: 'delete',
          });
          permissionsDs.transport.read = ({ data }) => {
            const postData = getTablePostData(data);
            return {
              url: `/devops/v1/projects/${projectId}/envs/${id}/permission/page_by_options`,
              method: 'post',
              data: postData,
            };
          };
          permissionsDs.query();
          break;
        case tabs.POLARIS_TAB:
          polarisNumDS.removeAll();
          istSummaryDs.removeAll();
          istSummaryDs.transport.read.url = `/devops/v1/projects/${projectId}/polaris/envs/${id}`;
          polarisNumDS.transport.read.url = `devops/v1/projects/${projectId}/polaris/records?scope=env&scope_id=${id}`;
          loadPolaris();
          break;
        default:
      }
    }

    async function loadPolaris() {
      const res = await envStore.checkHasInstance(projectId, id);
      if (res) {
        polarisNumDS.query();
        istSummaryDs.query();
      }
    }

    useEffect(() => {
      queryData();
    }, [projectId, id, envStore.getTabKey]);

    useEffect(() => {
      envStore.checkPermission({ projectId, organizationId, resourceType });
    }, [projectId, organizationId, resourceType]);

    const value = {
      ...props,
      tabs,
      baseInfoDs,
      permissionsDs,
      gitopsLogDs,
      gitopsSyncDs,
      retryDs,
      configDs,
      envStore,
      intlPrefix,
      polarisNumDS,
      istSummaryDs,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
));
