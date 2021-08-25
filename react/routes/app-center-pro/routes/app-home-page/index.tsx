import { observer } from 'mobx-react-lite';
import React from 'react';
import Content from './Content';
import { StoreProvider } from './stores';

export default observer((props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
));
