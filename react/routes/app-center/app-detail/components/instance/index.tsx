import React from 'react';
import Content from './Instance';
import { StoreProvider } from './stores';

export default (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
