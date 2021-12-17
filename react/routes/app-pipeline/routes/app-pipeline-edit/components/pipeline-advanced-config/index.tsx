import React from 'react';
import { observer } from 'mobx-react-lite';
import { StoreProvider } from './stores';
import Content from './content';

const Index = observer((props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
));

export default Index;
