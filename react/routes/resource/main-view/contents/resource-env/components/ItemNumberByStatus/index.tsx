import React from 'react';
import { countDisplay } from '../../utils';

type ItemNumberByStatusProps = {
  code: string
  count:number
  name: string
  prefixCls: string
}

function ItemNumberByStatus({
  code, count, name, prefixCls,
}:ItemNumberByStatusProps) {
  return (
    <div className={`${prefixCls}-re-grid-right-item`}>
      <div className={`${prefixCls}-re-status ${prefixCls}-re-status_${code}`}>
        {countDisplay(count, 99)}
      </div>
      <div className={`${prefixCls}-re-grid-right-text`}>
        <span>{name}</span>
      </div>
    </div>
  );
}

export default ItemNumberByStatus;
