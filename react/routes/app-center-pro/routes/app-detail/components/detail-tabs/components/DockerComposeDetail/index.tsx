import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const Index = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default Index;
