import React from 'react';
import Content from './Content';
import { StoreProvider } from './stores';

export default (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
