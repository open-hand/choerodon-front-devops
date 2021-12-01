import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';
import {
  CiVariasConfigsIndexProps,
} from './interface';
import './index.less';

const CiVariasConfigsIndex = (props: CiVariasConfigsIndexProps) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default CiVariasConfigsIndex;
