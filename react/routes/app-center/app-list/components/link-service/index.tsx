/* eslint-disable react/require-default-props */

import React from 'react';
import Content from './Content';
import { StoreProvider } from './stores';

interface Props {
  envId?: string,
  refresh(): void,
  showEnvSelect?: boolean,
}

export default (props: Props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
