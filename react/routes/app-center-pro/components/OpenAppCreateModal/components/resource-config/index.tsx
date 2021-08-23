import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const ResourceConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default ResourceConfig;
