/* eslint-disable react/require-default-props */
import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Tooltip } from 'choerodon-ui';
import MouseOverWrapper from '../MouseOverWrapper';
import projectImg from '../../images/project.svg';
import shareImg from '../../images/share.svg';
import marketImg from '../../images/market.svg';
import './AppName.less';

/**
 * 带icon的应用名称
 * @param { 应用名称，显示应用前icon，本组织or应用市场 } props
 */
export default function AppName(props) {
  const {
    name, showIcon, self, width, isInstance, hoverName,
  } = props;
  let icon;
  let type;
  if (isInstance) {
    icon = self;
    if (self === 'share') {
      type = 'share';
    } else if (self === 'market') {
      type = 'market';
    } else {
      type = 'project';
    }
  } else {
    icon = self ? 'widgets' : 'apps';
    type = self ? 'project' : 'market';
  }
  const imageUrl = { project: projectImg, share: shareImg, market: marketImg };
  return (
    <>
      {showIcon ? (
        <Tooltip title={<FormattedMessage id={type} />}>
          <img src={imageUrl[type]} style={{ width: '20px', height: '20px', marginRight: '2px' }} />
        </Tooltip>
      ) : null}
      {hoverName ? (
        <MouseOverWrapper className="c7ncd-app-text" width={width}>
          {name}
        </MouseOverWrapper>
      ) : (
        <MouseOverWrapper className="c7ncd-app-text" text={name} width={width}>
          {name}
        </MouseOverWrapper>
      )}
    </>
  );
}

AppName.propTypes = {
  name: PropTypes.string.isRequired,
  showIcon: PropTypes.bool.isRequired,
  self: PropTypes.bool.isRequired,
  hoverName: PropTypes.bool,
  width: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired,
  ]),
};
