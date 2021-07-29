import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';

interface Props {
  hostId: string,
}

const PermissionManagementIndex = (props: Props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default PermissionManagementIndex;
