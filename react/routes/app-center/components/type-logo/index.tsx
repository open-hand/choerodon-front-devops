import React, { memo } from 'react';

import './index.less';

interface props {
  type: 'project' | 'share' | 'market'
  size?: number | string,
  className?: string,
}

const AppTypeLogo: React.FC<props> = memo(({ type = 'project', size = 22, className }) => {
  const prefixCls = 'c7ncd-app-center-logo';
  const newSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      className={`${prefixCls} ${prefixCls}-${type} ${className || ''}`}
      style={{ width: newSize, height: newSize }}
    />
  );
});

export default AppTypeLogo;
