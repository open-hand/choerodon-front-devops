/* eslint-disable react/forbid-prop-types, react/require-default-props */

import React from 'react';
import PropTypes from 'prop-types';
import { Permission } from '@choerodon/boot';
import { Tooltip } from 'choerodon-ui';
import isEmpty from 'lodash/isEmpty';

import './index.less';

export default function ClickText(props) {
  const {
    value, clickAble, onClick, record, permissionCode, showToolTip, getClickEvent,
  } = props;
  const text = clickAble && onClick
    ? (
      <a
        className="c7ncd-click-text"
        onClick={handleClick}
        role="none"
      >
        {value}
      </a>
    )
    : <span>{ value }</span>;

  function handleClick(e) {
    onClick(record, getClickEvent ? e : null);
  }
  if (isEmpty(permissionCode)) {
    return (showToolTip ? <Tooltip title={value}>{text}</Tooltip>
      : text);
  }
  return (
    <Permission
      service={permissionCode}
      noAccessChildren={value}
      defaultChildren={value}
    >
      {showToolTip ? <Tooltip title={value}>{text}</Tooltip>
        : text }
    </Permission>
  );
}

ClickText.propTypes = {
  value: PropTypes.string.isRequired,
  clickAble: PropTypes.bool,
  onClick: PropTypes.func,
  record: PropTypes.any,
  permissionCode: PropTypes.array,
  showToolTip: PropTypes.bool,
  getClickEvent: PropTypes.bool,
};

ClickText.defaultProps = {
  clickAble: false,
  permissionCode: [],
  showToolTip: false,
  getClickEvent: false,
};
