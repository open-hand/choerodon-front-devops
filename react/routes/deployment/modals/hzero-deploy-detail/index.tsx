import React from 'react';
import { StoreProvider, StatusProps } from './stores';
import Content from './Content';

interface Props {
  status: StatusProps,
  recordId: string,
  refresh(): void,
  handleHzeroStop(recordId: string): void,
}

export default (props: Props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
