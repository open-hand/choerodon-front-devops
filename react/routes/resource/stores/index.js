import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
} from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { DataSet } from 'choerodon-ui/pro';
import queryString from 'query-string';
import { viewTypeMappings, itemTypeMappings } from './mappings';
import TreeDataSet from './TreeDataSet';
import useStore from './useStore';
import ResourceServices from '../services';

const Store = createContext();

export function useResourceStore() {
  return useContext(Store);
}

export const StoreProvider = withRouter(injectIntl(inject('AppState')(
  observer((props) => {
    const {
      intl: { formatMessage },
      AppState: { currentMenuType: { id, organizationId, name: projectName } },
      children,
      location: { state, search },
    } = props;
    const viewTypeMemo = useMemo(() => viewTypeMappings, []);
    const itemTypes = useMemo(() => itemTypeMappings, []);
    const {
      viewType: newViewType = viewTypeMemo.IST_VIEW_TYPE,
    } = state || queryString.parse(search) || {};
    const resourceStore = useStore(newViewType);
    const viewType = resourceStore.getViewType;
    const treeDs = useMemo(() => new DataSet(TreeDataSet({
      store: resourceStore,
      type: viewType,
      projectId: id,
      formatMessage,
      organizationId,
      projectName,
    })), [viewType, id]);

    useEffect(() => {
      // NOTE: 1、部署或实例视图的部署后跳转至实例视图实例层。2、资源视图的部署后跳转至资源视图实例层。
      // 3、消息通知通过url传参跳转至资源视图各资源列表层。
      handleSelect();
    }, []);

    const handleSelect = useCallback(async () => {
      const { IST_VIEW_TYPE, RES_VIEW_TYPE } = viewTypeMemo;
      const {
        envId, appServiceId, instanceId, itemType = 'instances',
      } = state || queryString.parse(search) || {};
      if (envId) {
        let newEnvId = envId;
        if (!state) {
          // NOTE: 通过消息通知跳转，需要对Id进行加解密处理
          const res = await ResourceServices.getEncrypt([envId]);
          if (res && res[envId]) {
            newEnvId = res[envId];
          }
        }
        if (newViewType === IST_VIEW_TYPE) {
          if (instanceId) {
            const parentId = `${newEnvId}**${appServiceId}`;
            resourceStore.setSelectedMenu({
              id: instanceId,
              parentId,
              key: `${parentId}**${instanceId}`,
              itemType: itemTypes.IST_ITEM,
            });
            resourceStore.setExpandedKeys([`${newEnvId}`, `${newEnvId}**${appServiceId}`]);
          } else {
            resourceStore.setSelectedMenu({
              id: newEnvId,
              parentId: '0',
              key: String(newEnvId),
              itemType: itemTypes.ENV_ITEM,
            });
            resourceStore.setExpandedKeys([`${newEnvId}`]);
          }
        } else {
          resourceStore.setSelectedMenu({
            id: 0,
            name: formatMessage({ id: itemType }),
            key: `${newEnvId}**${itemType}`,
            isGroup: true,
            itemType: `group_${itemType}`,
            parentId: String(newEnvId),
          });
          resourceStore.setExpandedKeys([`${newEnvId}`]);
        }
      }
    }, [state, search]);

    const value = {
      ...props,
      prefixCls: 'c7ncd-deployment',
      intlPrefix: 'c7ncd.deployment',
      permissions: [
        'devops-service.devops-environment.listEnvTree',
        'devops-service.devops-environment.listResourceEnvTree',
      ],
      viewTypeMappings: viewTypeMemo,
      itemTypes,
      resourceStore,
      treeDs,
    };
    return (
      <Store.Provider value={value}>
        {children}
      </Store.Provider>
    );
  }),
)));
