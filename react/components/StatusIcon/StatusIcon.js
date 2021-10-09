import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Tooltip, Spin, Icon } from 'choerodon-ui/pro';
import classnames from 'classnames';
import './StatusIcon.less';
import ClickText from '../click-text';

function StatusIcon(props) {
  const {
    status,
    error,
    name,
    intl: { formatMessage },
    width,
    handleAtagClick,
    clickAble,
    onClick,
    record,
    permissionCode,
    className,
    sourceType,
  } = props;
  let statusDom = null;
  const statusClass = classnames(className, {
    'c7n-status-deleted': status === 'deleted',
    'c7n-status-unset': handleAtagClick,
  });
  switch (status) {
    case 'failed': {
      const msg = error ? `: ${error}` : '';
      statusDom = (
        <Tooltip title={`failed ${msg}`}>
          <Icon type="error" className="c7n-status-failed" />
        </Tooltip>
      );
      break;
    }
    case 'operating':
      statusDom = (
        <Tooltip title={formatMessage({ id: 'ist_operating' })}>
          <Spin
            className="c7ncd-status-progress-span"
            spinning
          />
        </Tooltip>
      );
      break;
    case 'deleted':
      statusDom = (
        <Tooltip title={formatMessage({ id: 'deleted' })}>
          <Icon type="cancel" className="c7n-status-deleted" />
        </Tooltip>
      );
      break;
    default:
  }

  const handleClick = (e) => {
    e.preventDefault();
    handleAtagClick(name, e);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
    }}
    >
      {clickAble ? (
        <ClickText
          value={name}
          clickAble={clickAble}
          onClick={onClick}
          record={record}
          permissionCode={permissionCode}
          showToolTip
        />
      ) : (
        <Tooltip title={name}>
          <span className={statusClass}>{name}</span>
        </Tooltip>
      )}
      {statusDom}
    </div>
  );
}

StatusIcon.propTypes = {
  status: PropTypes.string,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  clickAble: PropTypes.bool,
  onClick: PropTypes.func,
  record: PropTypes.any,
  permissionCode: PropTypes.array,
  className: PropTypes.string,
};

StatusIcon.defaultProps = {
  clickAble: false,
};

export default injectIntl(StatusIcon);
