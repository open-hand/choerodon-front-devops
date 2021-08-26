import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const HostAppConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default HostAppConfig;
