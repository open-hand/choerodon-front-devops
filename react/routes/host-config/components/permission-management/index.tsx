import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';

interface Props {
  hostData: {
    id: string,
    skipCheckPermission: boolean,
    objectVersionNumber: number,
  },
  refresh(): void,
}

const PermissionManagementIndex = (props: Props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default PermissionManagementIndex;
