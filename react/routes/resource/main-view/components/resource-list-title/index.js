/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import { useFormatMessage } from '@choerodon/master';
import { useResourceStore } from '../../../stores';

import './index.less';

function ResourceListTitle({ type }) {
  const {
    treeDs,
    resourceStore: { getSelectedMenu: { parentId } },
    intl: { formatMessage },
    intlPrefix,
    prefixCls,
  } = useResourceStore();

  const format = useFormatMessage('c7ncd.resource');

  function getEnvName() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    if (envRecord) {
      return envRecord.get('name');
    }
  }

  return (
    <div className={`${prefixCls}-resource-list-title`}>
      {format({ id: type })}
    </div>
  );
}

ResourceListTitle.propTypes = {
  type: PropTypes.string.isRequired,
};

export default observer(ResourceListTitle);
