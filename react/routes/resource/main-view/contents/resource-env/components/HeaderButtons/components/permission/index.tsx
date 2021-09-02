import React from 'react';
import { StoreProvider } from './stores';
import EnvContent from './Content';

const Index = (props:any) => (
  <StoreProvider {...props}>
    <EnvContent />
  </StoreProvider>
);

export default Index;
