import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { instanceMappings } from '../../stores/CONST';
import { countDisplay } from '../../utils';

type ItemNumberByResource = {
  code: keyof typeof instanceMappings
  count:number
  name: string
  prefixCls: string
}

function ItemNumberByResource({
  code, count, name, prefixCls,
}:ItemNumberByResource) {
  return (
    <div className={`${prefixCls}-re-grid-left-item`}>
      <Icon type={instanceMappings[code].icon} className={`${prefixCls}-re-grid-left-icon`} />
      <span className={`${prefixCls}-re-grid-left-number`}>{countDisplay(count, 99)}</span>
      <Tooltip title={`${name}${instanceMappings[code].name && `(${instanceMappings[code].name})`}`}>
        <span className={`${prefixCls}-re-grid-left-name`}>{name}</span>
      </Tooltip>
    </div>
  );
}

export default ItemNumberByResource;
