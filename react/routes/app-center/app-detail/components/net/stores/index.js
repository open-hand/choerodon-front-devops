/* eslint-disable */
import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import { inject } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import { injectIntl } from 'react-intl';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import { axios } from '@choerodon/boot';
import getTablePostData from '../../../../../../utils/getTablePostData';
import NetDataSet from './NetDataSet';
import useDomainStore from './useDomainStore';
import useNetworkStore from './useNetworkStore';
import BaseInfoDataSet from './BaseInfoDataSet';

const Store = createContext();

export function useApplicationStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(observer((props) => {
  const {
    children,
    intl: { formatMessage },
    AppState: {
      currentMenuType: {
        projectId: proId,
      },
    },
  } = props;

  const {
    intlPrefix,
    mainStore,
    appServiceId,
    appServiceType,
  } = useAppCenterDetailStore();

  const baseInfoDs = useMemo(() => new DataSet(BaseInfoDataSet()), []);
  const netDs = useMemo(() => new DataSet(NetDataSet({
    formatMessage,
    intlPrefix,
  })), []);

  const domainStore = useDomainStore();
  const networkStore = useNetworkStore();

  async function checkExist({
    projectId, envId, type, id,
  }) {
    try {
      const res = await axios.get(`/devops/v1/projects/${projectId}/envs/${envId}/check?type=${type}&object_id=${id}`);
      if (typeof res === 'boolean') {
        return res;
      }
      // 只有请求到false，才返回false
      return true;
    } catch (e) {
      return true;
    }
  }

  function checkAppExist() {
    const envId = mainStore.getSelectedEnv.id;

    return checkExist({
      projectId: proId,
      type: 'app',
      envId,
      id: appServiceId,
    }).then((isExist) => {
      if (!isExist) {
        // openWarnModal(freshTree, formatMessage);
      }
      return isExist;
    });
  }

  const baseUrl = () => {
    let tempUrl;
    if (
      ['middleware', 'market'].includes(appServiceType)
    ) {
      tempUrl = `/market/v1/projects/${proId}/market/service/${appServiceId}/detail`;
    } else {
      tempUrl = `/devops/v1/projects/${proId}/app_service/${appServiceId}`;
    }
    return tempUrl;
  };

  function queryData() {
    netDs.query();
  }

  useEffect(() => {
    const envId = mainStore.getSelectedEnv.id;
    checkAppExist().then((query) => {
      if (query) {
        baseInfoDs.transport.read.url = baseUrl();
        baseInfoDs.query();
        netDs.transport.read = ({ data }) => {
          const postData = getTablePostData(data);
          return ({
            url: `/devops/v1/projects/${proId}/service/page_by_instance?env_id=${envId}&app_service_id=${appServiceId}`,
            method: 'post',
            data: postData,
          });
        };
        netDs.transport.destroy = ({ data: [data] }) => ({
          url: `/devops/v1/projects/${proId}/service/${data.id}`,
          method: 'delete',
        });
        // mappingDs.transport.read = ({ data }) => {
        //   const postData = getTablePostData(data);
        //   return ({
        //     url: `/devops/v1/projects/${projectId}/config_maps/page_by_options?env_id=${parentId}&app_service_id=${id}`,
        //     method: 'post',
        //     data: postData,
        //   });
        // };
        // mappingDs.transport.destroy = ({ data: [data] }) => ({
        //   url: `/devops/v1/projects/${projectId}/config_maps/${data.id}`,
        //   method: 'delete',
        // });
        // cipherDs.transport.read = ({ data }) => {
        //   const postData = getTablePostData(data);
        //   return ({
        //     url: `/devops/v1/projects/${projectId}/secret/page_by_options?env_id=${parentId}&app_service_id=${id}`,
        //     method: 'post',
        //     data: postData,
        //   });
        // };
        // cipherDs.transport.destroy = ({ data: [data] }) => ({
        //   url: `/devops/v1/projects/${projectId}/secret/${parentId}/${data.id}`,
        //   method: 'delete',
        // });
        queryData();
      }
    });
  }, [
    proId,
    appServiceId,
    mainStore.getSelectedEnv.id,
  ]);

  const value = {
    ...props,
    netDs,
    domainStore,
    networkStore,
  };

  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
})));
