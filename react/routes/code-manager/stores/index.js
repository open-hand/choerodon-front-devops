import React, {
  createContext, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import { useLocation } from 'react-router-dom';
import { isEmpty, includes, filter } from 'lodash';
import useStore from './useStore';
import AppServiceDs from './AppServiceDataSet';
import SelectAppDataSet from './SelectAppDataSet';
import handleMapStore from '../main-view/store/handleMapStore';

const Store = createContext();

export function useCodeManagerStore() {
  return useContext(Store);
}

export const StoreProvider = injectIntl(inject('AppState')(
  (props) => {
    const {
      children,
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = props;

    const {
      search, state,
    } = useLocation();

    const searchParams = new URLSearchParams(search);
    const urlAppServiceId = searchParams.get('appServiceId');

    const checkHasApp = (value, recentApp) => recentApp.some((e) => e?.id === value);

    function localSet(name, data) {
      if (typeof data !== 'string') {
        // eslint-disable-next-line no-param-reassign
        data = JSON.stringify(data);
      }
      localStorage.setItem(name, data);
    }

    const localGet = (name) => (localStorage.getItem(name)
      ? JSON.parse(localStorage.getItem(name)) : null);

    const unshiftPop = (value, recentApp, recentAppList) => { // 有数据的话又再一次访问这个appservice则把他放到数组第一位
      const deIndex = recentApp.findIndex((e) => e?.id === value[0].id);
      if (deIndex > -1) {
        recentApp.splice(deIndex, 1); // 如果数据组存在该元素，则把该元素删除
      }
      recentApp.unshift(value[0]);
      // eslint-disable-next-line no-param-reassign
      recentAppList[projectId] = recentApp;
      localSet('recent-app', JSON.stringify(recentAppList));
    };

    const setLocalStorage = (value) => {
      const recentAppList = localGet('recent-app');
      const temp = appServiceDs.toData().filter((e) => e?.id === value);
      const objTemp = {};
      if (isEmpty(temp)) {
        return;
      }
      if (recentAppList !== null && recentAppList[projectId]) {
        const recentApp = recentAppList[projectId];
        if (!checkHasApp(value, recentApp)) { // 先校验localstorage里面有没有这个数据
          !isEmpty(temp) && recentApp.unshift(temp[0]);
          if (recentApp.length > 5) {
            recentApp.splice(-1, 1);
          }
          recentAppList[projectId] = recentApp;
          localSet('recent-app', JSON.stringify(recentAppList));
        } else {
          unshiftPop(temp, recentApp, recentAppList);
        }
      } else if (recentAppList === null) {
        if (!isEmpty(temp)) {
          objTemp[projectId] = [temp[0]];
        }
        localSet('recent-app', JSON.stringify(objTemp));
      } else {
        if (!isEmpty(temp)) {
          recentAppList[projectId] = [temp[0]];
        }
        localSet('recent-app', JSON.stringify(recentAppList));
      }
    };

    const handleDataSetChange = ({
      dataSet, record, value, oldValue,
    }) => {
      if (!value) return;
      const option = {
        props: {
          children: record.get('name'),
          value: record.get('id'),
        },
      };
      setLocalStorage(value);
      localSet('selectAppId', value);
      Object.keys(handleMapStore)
        .forEach((key) => {
          if (key.indexOf('Code') !== -1) {
            handleMapStore[key]
              && handleMapStore[key].select
              && handleMapStore[key].select(value, option);
          }
        });
    };

    const updateLocalAppService = (appServiceList) => {
      const recentAppList = localGet('recent-app');
      if (recentAppList && recentAppList[projectId]) {
        const recentApp = recentAppList[projectId] || [];
        const codeArr = [];
        recentApp.forEach((item) => {
          if (item && item.id && item.code) {
            codeArr.push(item.code);
          }
        });
        const newData = filter(appServiceList, (item) => includes(codeArr, item.code));
        if (newData && newData.length) {
          recentAppList[projectId] = newData.slice(0, 5);
          localSet('recent-app', JSON.stringify(recentAppList));
        }
      }
    };

    const appServiceDs = useMemo(() => new DataSet(AppServiceDs({ projectId })), []);
    const codeManagerStore = useStore();
    const selectAppDs = useMemo(
      () => new DataSet(SelectAppDataSet({ handleDataSetChange, codeManagerStore })), [],
    );
    const permissions = useMemo(() => (['choerodon.code.project.develop.code-management.ps.default']), []);

    useEffect(() => {
      codeManagerStore.checkHasApp(projectId);
    }, []);

    useEffect(() => {
      appServiceDs.transport.read = () => ({
        url: `/devops/v1/projects/${projectId}/app_service/list_by_active`,
        method: 'get',
      });
      appServiceDs.query().then((res) => {
        if (state && state.appServiceId) {
          selectAppDs.current && selectAppDs.current.set('appServiceId', state.appServiceId);
          return;
        }
        if (res && res.length && res.length > 0) {
          updateLocalAppService(res);
          const recentAppList = localGet('recent-app');
          let newAppServiceId;
          if (urlAppServiceId) {
            codeManagerStore.handleEncrept(urlAppServiceId, (encodeId) => {
              selectAppDs.current.set('appServiceId', encodeId);
            });
            return;
          }
          if (recentAppList !== null && !isEmpty(recentAppList[projectId])) {
            const cacheId = recentAppList[projectId].find((i) => String(i.id) === String(localStorage.getItem('selectAppId')));
            newAppServiceId = (cacheId && localStorage.getItem('selectAppId')) || recentAppList[projectId][0]?.id;
          } else {
            const cacheId = res.find((i) => String(i.id) === String(localStorage.getItem('selectAppId')));
            newAppServiceId = (cacheId && localStorage.getItem('selectAppId')) || res[0]?.id;
          }
          selectAppDs.current.set('appServiceId', newAppServiceId);
        }
      });
    }, [projectId]);

    const value = {
      ...props,
      prefixCls: 'c7ncd-code-manager',
      intlPrefix: 'c7ncd.code-manager',
      itemType: {
        CIPHER_ITEM: 'secrets',
        CUSTOM_ITEM: 'customResources',
      },
      codeManagerStore,
      permissions,
      appServiceDs,
      selectAppDs,
      projectId,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  },
));
