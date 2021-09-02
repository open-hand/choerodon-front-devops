import React, { memo } from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import './index.less';

interface props {
  type: 'project' | 'share' | 'market' | 'hzero'
  size?: number | string,
  className?: string,
}

const AppTypeLogo: React.FC<props> = memo(({ type = 'project', size = 22, className }) => {
  const prefixCls = 'c7ncd-app-center-logo';
  const newSize = typeof size === 'number' ? `${size}px` : size;
  const text = {
    project: '项目应用',
    share: '共享应用',
    market: '市场应用',
    hzero: 'HZERO应用',
  };
  return (
    <Tooltip title={text[type] || '项目应用'} placement="top">
      <div
        className={`${prefixCls} ${prefixCls}-${type} ${className || ''}`}
        style={{ width: newSize, height: newSize }}
      />
    </Tooltip>
  );
});

export default AppTypeLogo;
