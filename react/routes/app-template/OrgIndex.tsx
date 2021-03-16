import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';

export default (props: any) => (
  <StoreProvider {...props} pageType="organization">
    <Content />
  </StoreProvider>
);
