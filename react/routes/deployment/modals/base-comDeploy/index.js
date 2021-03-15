import React from 'react';
import { observer } from 'mobx-react-lite';
import { StoreProvider } from './stores';
import Content from './Content';

export default observer((props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
));
