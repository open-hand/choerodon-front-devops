import React from 'react';
import Content from './Content';
import { StoreProvider } from './stores';

const Index = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default Index;
