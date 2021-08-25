import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const DeployGroupConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default DeployGroupConfig;
