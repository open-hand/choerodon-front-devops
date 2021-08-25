/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import { observer } from 'mobx-react-lite';
import Content from './Content';
import { StoreProvider } from './stores';

export default observer((props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
));
