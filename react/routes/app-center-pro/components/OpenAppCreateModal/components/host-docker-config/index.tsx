import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const hostDockerConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default hostDockerConfig;
