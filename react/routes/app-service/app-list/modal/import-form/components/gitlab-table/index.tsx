import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';

const Index = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default Index;
