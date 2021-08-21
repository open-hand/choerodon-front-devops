import { Tag } from '@choerodon/components';
import React from 'react';

export type appType = 'create_app' | 'hzero' | 'batch_deploy' | 'base_component';

export const AppTypeMap:{
  [ket in appType]: {
    name: string,
    color: string
  }
} = {
  create_app: {
    name: '创建',
    color: 'blue',
  },
  hzero: {
    name: 'HZERO',
    color: 'purple',
  },
  batch_deploy: {
    name: '批量',
    color: 'green',
  },
  base_component: {
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
