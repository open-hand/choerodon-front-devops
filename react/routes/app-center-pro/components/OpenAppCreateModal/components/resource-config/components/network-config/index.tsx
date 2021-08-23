import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const NetworkConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default NetworkConfig;
