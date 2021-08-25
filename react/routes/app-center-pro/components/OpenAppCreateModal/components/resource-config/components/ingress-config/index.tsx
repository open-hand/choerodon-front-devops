import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const IngressConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default IngressConfig;
