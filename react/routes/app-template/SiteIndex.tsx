import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';

export default (props: any) => (
  <StoreProvider {...props} pageType="site">
    <Content />
  </StoreProvider>
);
