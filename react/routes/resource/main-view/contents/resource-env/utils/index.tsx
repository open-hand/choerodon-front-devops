import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

function countDisplay(count:number, max:number) {
  return count > max ? <Tooltip title={count}>{`${max}+`}</Tooltip> : count;
}

export {
  countDisplay,
};
