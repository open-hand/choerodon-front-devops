import React from 'react';
import { StoreProvider } from './stores';
import Net from './Net';

export default (props) => (
  <StoreProvider {...props}>
    <Net />
  </StoreProvider>
);
