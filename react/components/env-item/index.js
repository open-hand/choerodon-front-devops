/* eslint-disable */
import React, { Fragment, memo } from 'react';
import { useFormatMessage } from '@choerodon/master';
import PropTypes from 'prop-types';
import StatusDot from '../status-dot';

import './index.less';

const EnvironmentItem = memo(({
  name, connect, synchronize, active, clusterName, failed, isTitle, formatMessage,
}) => {
  const format = useFormatMessage('c7ncd.resource');

  return (
    <>
      <StatusDot
        active={active}
        connect={connect}
        failed={failed}
        synchronize={synchronize}
        size={isTitle ? 'normal' : 'small'}
      />
      {isTitle ? <span className="c7ncd-env-title">{name}</span> : <span className="c7ncd-env-title-default">{name}</span>}
      {clusterName ? (
        <span className="c7ncd-env-cluster">
          (
          {format({ id: 'ConnecttoCluster' })}
          :
          {clusterName}
          )
        </span>
      ) : null}
    </>
  );
});

EnvironmentItem.propTypes = {
  name: PropTypes.any.isRequired,
  active: PropTypes.bool,
  connect: PropTypes.bool,
  synchronize: PropTypes.bool,
  failed: PropTypes.bool,
  isTitle: PropTypes.bool,
};

EnvironmentItem.defaultProps = {
  active: true,
  failed: false,
  isTitle: false,
  synchronize: true,
};

export default EnvironmentItem;
