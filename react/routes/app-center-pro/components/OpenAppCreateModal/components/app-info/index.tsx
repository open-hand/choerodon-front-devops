import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const AppInfo = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default AppInfo;
