import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { injectIntl } from 'react-intl';
import getTablePostData from '../../../../../../utils/getTablePostData';
import openWarnModal from '../../../../../../utils/openWarnModal';
import BaseInfoDataSet from './BaseInfoDataSet';
import NetDataSet from './NetDataSet';
import ConfigDataSet from './ConfigDataSet';
import { useResourceStore } from '../../../../stores';
import useStore from './useStore';
import useConfigMapStore from './useConfigMapStore';
import useSecretStore from './useSecretStore';
import useDomainStore from './useDomainStore';
import useNetworkStore from './useNetworkStore';

const Store = createContext();

export function useApplicationStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(observer((props) => {
  const { children, intl: { formatMessage } } = props;
  const {
    AppState: { currentMenuType: { id: projectId } },
    resourceStore,
    intlPrefix,
    treeDs,
  } = useResourceStore();
  const {
    getSelectedMenu: {
      id, parentId, itemType, type,
    },
  } = resourceStore;
  const tabs = useMemo(() => ({
    NET_TAB: 'net',
    MAPPING_TAB: 'mapping',
    CIPHER_TAB: 'cipher',
  }), []);
  const appStore = useStore(tabs);

  const baseInfoDs = useMemo(() => new DataSet(BaseInfoDataSet()), []);
  const netDs = useMemo(() => new DataSet(NetDataSet({ formatMessage, intlPrefix, appStore })), []);
  const mappingDs = useMemo(() => new DataSet(ConfigDataSet(formatMessage)), []);
  const cipherDs = useMemo(() => new DataSet(ConfigDataSet(formatMessage)), []);

  const mappingStore = useConfigMapStore();
  const cipherStore = useSecretStore();
  const domainStore = useDomainStore();
  const networkStore = useNetworkStore();

  function queryData() {
    const tabKey = appStore.getTabKey;
    switch (tabKey) {
      case tabs.NET_TAB:
        netDs.query();
        break;
      case tabs.MAPPING_TAB:
        mappingDs.query();
        break;
      case tabs.CIPHER_TAB:
        cipherDs.query();
        break;
      default:
    }
  }

  function freshTree() {
    treeDs.query();
  }

  function checkAppExist() {
    return resourceStore.checkExist({
      projectId,
      type: 'app',
      envId: parentId,
      id,
    }).then((isExist) => {
      if (!isExist) {
        openWarnModal(freshTree, formatMessage);
      }
      return isExist;
    });
  }

  const baseUrl = () => {
    let tempUrl;
    if (['middleware_service', 'market_service'].includes(type)) {
      tempUrl = `/market/v1/projects/${projectId}/market/service/${id}/detail`;
    } else {
      tempUrl = `/devops/v1/projects/${projectId}/app_service/${id}`;
    }
    return tempUrl;
  };

  useEffect(() => {
    checkAppExist().then((query) => {
      if (query) {
        baseInfoDs.transport.read.url = baseUrl();
        baseInfoDs.query();
        netDs.transport.read = ({ data }) => {
          const postData = getTablePostData(data);
          return ({
            url: `/devops/v1/projects/${projectId}/service/page_by_instance?env_id=${parentId}&app_service_id=${id}`,
            method: 'post',
            data: postData,
          });
        };
        netDs.transport.destroy = ({ data: [data] }) => ({
          url: `/devops/v1/projects/${projectId}/service/${data.id}`,
          method: 'delete',
        });
        mappingDs.transport.read = ({ data }) => {
          const postData = getTablePostData(data);
          return ({
            url: `/devops/v1/projects/${projectId}/config_maps/page_by_options?env_id=${parentId}&app_service_id=${id}`,
            method: 'post',
            data: postData,
          });
        };
        mappingDs.transport.destroy = ({ data: [data] }) => ({
          url: `/devops/v1/projects/${projectId}/config_maps/${data.id}`,
          method: 'delete',
        });
        cipherDs.transport.read = ({ data }) => {
          const postData = getTablePostData(data);
          return ({
            url: `/devops/v1/projects/${projectId}/secret/page_by_options?env_id=${parentId}&app_service_id=${id}`,
            method: 'post',
            data: postData,
          });
        };
        cipherDs.transport.destroy = ({ data: [data] }) => ({
          url: `/devops/v1/projects/${projectId}/secret/${parentId}/${data.id}`,
          method: 'delete',
        });
        queryData();
      }
    });
  }, [
    projectId,
    id,
    parentId,
    appStore.getTabKey,
  ]);

  const value = {
    ...props,
    tabs,
    baseInfoDs,
    netDs,
    mappingDs,
    cipherDs,
    appStore,
    mappingStore,
    cipherStore,
    domainStore,
    networkStore,
    checkAppExist,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
}));
