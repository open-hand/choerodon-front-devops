/* eslint-disable max-len */
import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import toUpper from 'lodash/toUpper';
import { Action } from '@choerodon/boot';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import ClusterItem from './ClusterItem';
import { useClusterStore } from '../../../stores';
import { useClusterMainStore } from '../../stores';

import './index.less';

function getName(name, search, prefixCls, errorMes) {
  const index = toUpper(name).indexOf(toUpper(search));
  const beforeStr = name.substr(0, index);
  const currentStr = name.substr(index, search.length);
  const afterStr = name.substr(index + search.length);

  return (
    <span className={`${prefixCls}-tree-text`}>
      {index > -1 ? (
        <>
          {beforeStr}
          <span className={`${prefixCls}-tree-text-highlight`}>{currentStr}</span>
          {afterStr}
        </>
      ) : name}
      {
        errorMes && (
        <Tooltip title={errorMes}>
          <Icon type="info" style={{ color: '#f77a70', marginLeft: '8px', fontSize: '15px' }} />
        </Tooltip>
        )
      }
    </span>
  );
}

const TreeItem = observer(({ record, search }) => {
  const {
    prefixCls,
    intlPrefix,
    itemType: {
      CLU_ITEM,
      NODE_ITEM,
    },
  } = useClusterStore();
  const { podColor } = useClusterMainStore();

  const name = useMemo(() => {
    const itemName = record.get('name');
    const errorMes = record.get('errorMessage');
    return getName(itemName, search, prefixCls, errorMes);
  }, [record, search]);

  function getIconItem(type) {
    const iconMappings = {
      [NODE_ITEM]: 'adjust',
    };
    const iconType = iconMappings[type];
    return (
      <>
        <Icon type={iconType} />
        {name}
      </>
    );
  }

  function getCluIcon() {
    return <ClusterItem name={name} record={record} intlPrefix={intlPrefix} prefixCls={prefixCls} />;
  }

  function getItem() {
    const type = record.get('itemType');
    const isExpand = record.isExpanded;
    const isGroup = record.get('isGroup');

    if (isGroup) {
      return (
        <>
          {isExpand ? <Icon type="folder_open2" /> : <Icon type="folder_open" />}
          {name}
        </>
      );
    }

    let treeItem;
    switch (type) {
      case CLU_ITEM:
        treeItem = getCluIcon();
        break;
      case NODE_ITEM:
        treeItem = getIconItem(type);
        break;
      default:
        treeItem = null;
    }
    return (
      <>
        {treeItem}
        {/* <div className="tree-node-selected" /> */}
      </>
    );
  }

  return getItem();
});

TreeItem.propTypes = {
  record: PropTypes.shape({}),
  search: PropTypes.string,
};

TreeItem.defaultProps = {
  record: {},
};

export default TreeItem;
