/* eslint-disable no-param-reassign */

import React, { useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { useFormatMessage } from '@choerodon/master';
import { Icon, TextField, Tree } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import toUpper from 'lodash/toUpper';
import { useDebounceFn } from 'ahooks';
import ScrollContext from 'react-infinite-scroll-component';
import { usePipelineManageStore } from '../../stores';
import TreeItem from './TreeItem';

import './index.less';

const TreeMenu = observer(() => {
  const {
    intl: { formatMessage },
    mainStore,
    prefixCls,
    treeDs,
    projectId,
  } = usePipelineManageStore();

  const format = useFormatMessage('c7ncd.pipelineManage');

  const bounds = useMemo(() => mainStore.getNavBounds, [mainStore.getNavBounds]);

  /**
   * 展开节点的所有父节点
   * 通过Record内置的方法展开目标节点
   * 将展开节点缓存进传入的数组
   * @param record
   * @param expendedKeys
   */
  function expandParents(record, expendedKeys) {
    if (!record.isExpanded) {
      const { children, parent } = record;

      if ((children && children.length) || record.get('hasRecords')) {
        const key = record.get('key');
        expendedKeys.push(key);
        record.isExpanded = true;
      }

      if (parent && !parent.isExpanded) {
        expandParents(parent, expendedKeys);
      }
    }
  }

  const handleSearch = async (value) => {
    const realValue = value || '';
    const expandedKeys = [];

    // NOTE: 让多个 action 只执行一次
    runInAction(async () => {
      mainStore.setTreeDataPage(1);
      mainStore.setSearchValue(realValue);
      mainStore.setLoadedKeys([]);
      handleExpanded([]);
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
        record.isExpanded = false;
      });
      await treeDs.query();
      treeDs.forEach((treeRecord) => {
        const pipelineName = treeRecord.get('name');
        const appServiceName = treeRecord.get('appServiceName');
        const parentId = treeRecord.get('parentId');
        const id = parentId && treeRecord.get('viewId') ? treeRecord.get('viewId').toString() : null;
        if (value) {
          if (!parentId && (toUpper(pipelineName)?.indexOf(toUpper(value)) > -1
            || toUpper(appServiceName)?.indexOf(toUpper(value)) > -1)
          ) {
            expandParents(treeRecord, expandedKeys);
          } else if (parentId && toUpper(id)?.indexOf(toUpper(value)) > -1) {
            expandParents(treeRecord, expandedKeys);
          }
        }
      });
    });

    const uniqKeys = new Set(expandedKeys);
    handleExpanded([...uniqKeys]);
  };

  const { run: handelDebounceSearch } = useDebounceFn(handleSearch, {
    wait: 1000,
  });

  function handleExpanded(keys) {
    mainStore.setExpandedKeys(keys);
  }

  const loadMoreTreeData = async () => {
    const page = mainStore.getTreeDataPage;
    mainStore.setTreeDataPage(page + 1);
    treeDs.query();
  };

  const onLoadData = async ({ key, children }) => {
    if (!children) {
      await mainStore.loadRecordData({ projectId, key, treeDs });
    }
  };

  function nodeCover({ record }) {
    const nodeProps = {
      title: <TreeItem record={record} search={mainStore.getSearchValue} />,
    };
    if (!record.get('hasRecords')) {
      nodeProps.isLeaf = true;
    }
    return nodeProps;
  }

  return (
    <nav style={bounds} className={`${prefixCls}-sidebar`}>
      <TextField
        className={`${prefixCls}-sidebar-search`}
        placeholder={format({ id: 'Search' })}
        clearButton
        name="search"
        prefix={<Icon type="search" />}
        value={mainStore.getSearchValue}
        onChange={handelDebounceSearch}
        valueChangeAction="input"
      />
      {!treeDs.length && treeDs.status === 'ready' ? (
        <span className={`${prefixCls}-sidebar-empty`}>{formatMessage({ id: 'nodata' })}</span>
      ) : (
        <ScrollContext
          className={`${prefixCls}-sidebar-scroll`}
          dataLength={treeDs.length}
          next={loadMoreTreeData}
          hasMore={mainStore.getTreeDataHasMore}
          loader={null}
          height="100%"
        >
          <Tree
            dataSet={treeDs}
            // renderer={nodeRenderer}
            // eslint-disable-next-line react/jsx-no-bind
            onExpand={handleExpanded}
            className={`${prefixCls}-sidebar-tree`}
            loadData={onLoadData}
            // eslint-disable-next-line react/jsx-no-bind
            treeNodeRenderer={nodeCover}
            loadedKeys={mainStore.getLoadedKeys}
          />
        </ScrollContext>
      )}
    </nav>
  );
});

export default TreeMenu;
