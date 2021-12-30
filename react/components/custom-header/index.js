import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from '@choerodon/master';

import './index.less';

const CustomHeader = memo(({ show }) => (
  <div className="c7ncd-custom-header">
    <Breadcrumb />
    {/* {show && <div className="c7ncd-custom-header-placeholder" />} */}
  </div>
));

CustomHeader.propTypes = {
  show: PropTypes.bool,
};

CustomHeader.defaultProps = {
  show: false,
};

export default CustomHeader;
