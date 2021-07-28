/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import { StoreProvider } from './stores';
import KeyValuePro from './Content';

export default (props:any) => (
  <StoreProvider {...props}>
    <KeyValuePro />
  </StoreProvider>
);
