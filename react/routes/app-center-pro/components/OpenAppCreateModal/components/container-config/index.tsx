import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const ContainerConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default ContainerConfig;
