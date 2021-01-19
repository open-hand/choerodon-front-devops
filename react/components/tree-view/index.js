import React, { Fragment, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import toUpper from 'lodash/toUpper';
import { uniqBy } from 'lodash';
import { Tree } from 'choerodon-ui/pro';
import classnames from 'classnames';
import ScrollArea from '../scroll-area';
import TreeSearch from './tree-search';

import './index.less';

/**
 * 展开节点的所有父节点
 * 通过Record内置的方法展开目标节点
 * 将展开节点缓存进传入的数组
 * @param record
 * @param expendedKeys
 */
function expandParents(record, expendedKeys) {
  if (!record.isExpanded) {
    const { children } = record;

    if (children && children.length) {
      const key = record.get('key');
      expendedKeys.push(key);
      // eslint-disable-next-line no-param-reassign
      record.isExpanded = true;
    }

    const { parent } = record;
    if (parent && !parent.isExpanded) {
      expandParents(parent, expendedKeys);
    }
  }
}

/**
 * 获取子节点
 */
function getChildren(record, childrenRecords) {
  const { children } = record;
  if (children && children.length) {
    childrenRecords.push(...children);
    children.forEach((childrenRecord) => getChildren(childrenRecord, childrenRecords));
  }
}

/**
 * 获取父节点
 */
function getParent(record, parentRecords) {
  const { parent } = record;
  if (parent) {
    parentRecords.push(parent);
    getParent(parent, parentRecords);
  }
}

const TreeView = observer(({
  ds, store, nodesRender, searchAble, isFilter,
}) => {
  const treeClass = useMemo(() => classnames({
    'c7ncd-menu-wrap': true,
    'c7ncd-menu-scroll': searchAble,
  }), [searchAble]);

  const nodeRenderer = useCallback(({ record }) => nodesRender(record, store.getSearchValue),
    [store.getSearchValue]);

  function handleSearch(value) {
    const realValue = value || '';
    const expandedKeys = [];
    const searchRecords = [];

    if (isFilter) {
      store.setSearchValue(realValue);
      if (!value) {
        ds.query();
        return;
      }
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
      ds.forEach((record) => {
        record.reset();

        /**
         * 未清除搜索值就刷新，Record会记录expand状态，导致上一步record.reset()失效
         * */
        // eslint-disable-next-line no-param-reassign
        record.isExpanded = false;
      });
      ds.forEach((record) => {
        const name = record.get('name');

        if (value && toUpper(name).indexOf(toUpper(value)) > -1) {
          expandParents(record, expandedKeys);

          if (isFilter) {
            const childrenRecords = [];
            const parentRecords = [];
            getChildren(record, childrenRecords);
            getParent(record, parentRecords);
            searchRecords.push(record, ...parentRecords, ...childrenRecords);
          }
        }
      });
      if (isFilter) {
        const uniqKeys = new Set(expandedKeys);
        const newSearchRecords = uniqBy(searchRecords, 'id');
        handleExpanded([...uniqKeys]);
        ds.loadData(newSearchRecords.map((eachRecord) => eachRecord.toData()));
      }
    });

    if (!isFilter) {
      const uniqKeys = new Set(expandedKeys);
      store.setSearchValue(realValue);
      handleExpanded([...uniqKeys]);
    }
  }

  function handleExpanded(keys) {
    store.setExpandedKeys(keys);
  }

  return (
    <>
      {searchAble && <TreeSearch value={store.getSearchValue} onChange={handleSearch} />}
      <ScrollArea
        vertical
        className={treeClass}
      >
        <Tree
          className="c7ncd-menu"
          onExpand={handleExpanded}
          dataSet={ds}
          renderer={nodeRenderer}
        />
        {store.getSearchValue && !ds.length && (
          <span className="c7ncd-menu-search-empty">暂无数据</span>
        )}
      </ScrollArea>
    </>
  );
});

TreeView.propTypes = {
  ds: PropTypes.shape({}).isRequired,
  nodesRender: PropTypes.func.isRequired,
  searchAble: PropTypes.bool,
  isFilter: PropTypes.bool,
};

TreeView.defaultProps = {
  searchAble: true,
  isFilter: false,
};

export default TreeView;
