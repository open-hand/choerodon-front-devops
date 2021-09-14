import React from 'react';
import { StoreProvider } from './stores';
import Content from './content';

const hostOtherProduct = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default hostOtherProduct;
