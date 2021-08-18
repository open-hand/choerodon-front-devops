import { Tag } from '@choerodon/components';
import React from 'react';

export type appType = 'mannual' | 'hzero' | 'batch' | 'deploy';

export const AppTypeMap:{
  [ket in appType]: {
    name: string,
    color: string
  }
} = {
  mannual: {
    name: '创建',
    color: 'blue',
  },
  hzero: {
    name: 'HZERO',
    color: 'purple',
  },
  batch: {
    name: '批量',
    color: 'green',
  },
  deploy: {
    name: '部署',
    color: 'orange',
  },
};

const AppType = ({
  type,
}:{
  type: appType
}) => (
  <Tag
    style={{
      marginLeft: '12px',
    }}
    type="border"
    color={AppTypeMap[type]?.color || 'gray'}
  >
    {AppTypeMap[type]?.name || 'UNKNOWN'}
  </Tag>
);
export default AppType;
