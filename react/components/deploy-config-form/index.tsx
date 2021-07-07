/* eslint-disable react/require-default-props */

import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';

interface Props {
  envId: string,
  appServiceId?: string,
  refresh(): void,
  deployConfigId?: string,
  appServiceName?: string, // appSelectDisabled为true时应用服务框显示内容
  appSelectDisabled?: boolean, // 创建时应用服务下拉框是否禁用
}

export default (props: Props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
