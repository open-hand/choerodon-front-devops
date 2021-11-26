import React from 'react';
import { StoreProvider } from './stores';
import AddCDTask from './AddCDTask';
import SideTab from '../side-tab';

export default (props) => (
  <StoreProvider {...props}>
    <SideTab
      component={<AddCDTask />}
    />
  </StoreProvider>
);
