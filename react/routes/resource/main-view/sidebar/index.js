import React, { useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import { runInAction } from 'mobx';
import {
  uniqBy, toUpper, forEach, isEmpty, get, some,
} from 'lodash';
import setEnvRecentItem from '../../../../utils/setEnvRecentItem';
import { itemTypeMappings, RES_TYPES } from '../../stores/mappings';
import SidebarHeading from './header';
import setTreeMenuSelect from '../../../../utils/setTreeMenuSelect';
import TreeView from '../../../../components/tree-view';
import TreeItem from './tree-item';
import { useResourceStore } from '../../stores';
import { useMainStore } from '../stores';

import './index.less';
import './theme4.less';

const { ENV_ITEM } = itemTypeMappings;

const TreeMenu = observer(() => {
  const {
    treeDs,
    prefixCls,
    resourceStore,
    AppState: { currentMenuType: { projectId, organizationId, name: projectName } },
    intl: { formatMessage },
    viewTypeMappings: {
      RES_VIEW_TYPE,
      IST_VIEW_TYPE,
    },
  } = useResourceStore();
  const { mainStore } = useMainStore();

  const bounds = useMemo(() => mainStore.getNavBounds, [mainStore.getNavBounds]);
  const loadedKeys = useMemo(() => resourceStore.getLoadedKeys, [resourceStore.getLoadedKeys]);
  const nodeRenderer = useCallback(
    (record, search) => <TreeItem record={record} search={search} />, [],
  );

  useEffect(() => {
    const { key } = resourceStore.getSelectedMenu || {};
    if (!key || !some(resourceStore.getAllTreeData, ['key', key]) || resourceStore.getSearchValue) {
      setTreeMenuSelect(treeDs, resourceStore, getEnvItem);
    }
  }, [treeDs.data]);

  function getEnvItem(record) {
    const item = getParentRecord(record);
    if (item && item.itemType === ENV_ITEM) {
      const recentEnv = {
        ...item,
        active: true,
        projectId,
        organizationId,
        projectName,
        clickTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
      setEnvRecentItem({ value: recentEnv });
    }
  }

  function getParentRecord(record) {
    if (record.parent) {
      return getParentRecord(record.parent);
    }
    return record.toData();
  }

  const getAllParents = useCallback((key, parentRecords, expandedKeys) => {
    const parentRecord = resourceStore.getParentDataMap.get(key);
    if (parentRecord) {
      const parent = { ...parentRecord };
      parent.expand = true;
      expandedKeys.push(parentRecord.key);
      parentRecords.push(parent);
      getAllParents(parentRecord.key, parentRecords, expandedKeys);
    }
  }, []);

  const getAllChildren = useCallback((key, childrenRecords) => {
    const children = resourceStore.getChildrenDataMap.get(key);
    if (!isEmpty(children)) {
      childrenRecords.push(...children);
      forEach(children, (item) => {
        getAllChildren(item.key, childrenRecords);
      });
    }
  }, []);

  const handleExpanded = useCallback((keys) => {
    resourceStore.setExpandedKeys(keys);
  }, []);

  async function handleSearch(value) {
    const realValue = value || '';
    const expandedKeys = [];
    const searchRecords = [];
    resourceStore.setSearchValue(realValue);
    resourceStore.setLoadedKeys([]);
    resourceStore.setExpandedKeys([]);
    if (!value) {
      treeDs.query();
      return;
    }
    if (value && resourceStore.getSearchValue && value !== resourceStore.getSearchValue) {
      await treeDs.query();
    }
    // NOTE: 让多个 action 只执行一次
    runInAction(() => {
      /**
       *
       * 如果在 DataSet 的 load 方法中对原始数据进行了修改
       * 那么就不能使用 ds.reset(); 进行重置，因为该方法是基于 originalData 的
       * 应该手动将各记录重置
       *
       * */
      treeDs.forEach((record) => {
        record.reset();

        /**
         * 未清除搜索值就刷新，Record会记录expand状态，导致上一步record.reset()失效
         * */
        // eslint-disable-next-line no-param-reassign
        record.isExpanded = false;
      });
      forEach(resourceStore.getAllTreeData, (node) => {
        const name = get(node, 'name');
        const key = get(node, 'key');

        if (value && toUpper(name).indexOf(toUpper(value)) > -1) {
          const childrenRecords = [];
          const parentRecords = [];
          const newNode = { ...node };
          getAllParents(key, parentRecords, expandedKeys);
          getAllChildren(key, childrenRecords);
          if (!isEmpty(childrenRecords)) {
            newNode.expand = true;
            expandedKeys.push(key);
          }
          searchRecords.push(newNode, ...parentRecords, ...childrenRecords);
        }
      });
      const uniqKeys = new Set(expandedKeys);
      const newSearchRecords = uniqBy(searchRecords, 'key');
      handleExpanded([...uniqKeys]);
      resourceStore.setLoadedKeys([...uniqKeys]);
      treeDs.loadData(newSearchRecords);
    });
  }

  const onLoadData = useCallback(async ({ record, key, children }) => {
    resourceStore.loadMoreRecordData({ key, treeDs, children });
  }, [projectId]);

  const nodeCover = useCallback(({ record }) => {
    const nodeProps = {
      title: nodeRenderer(record, resourceStore.getSearchValue),
      isLeaf: record.get('isLeaf'),
    };
    return nodeProps;
  }, [resourceStore.getSearchValue]);

  return (
    <nav style={bounds} className={`${prefixCls}-sidebar`}>
      <SidebarHeading />
      <div className={`${prefixCls}-sidebar-menu`}>
        <TreeView
          ds={treeDs}
          store={resourceStore}
          nodesRender={nodeRenderer}
          isFilter
          onSearch={handleSearch}
          otherTreeProps={{
            loadData: onLoadData,
            loadedKeys,
            treeNodeRenderer: nodeCover,
          }}
        />
      </div>
    </nav>
  );
});

export default TreeMenu;
