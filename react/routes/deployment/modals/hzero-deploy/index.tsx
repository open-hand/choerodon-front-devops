import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';

interface Props {
  syncStatus: { open: boolean, sass: boolean },
}

export default (props: Props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
