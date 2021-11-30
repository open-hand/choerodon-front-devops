import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';
import {
  StageEditsIndexProps,
} from './interface';
import './index.less';

const StageEditsIndex = (props: StageEditsIndexProps) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default StageEditsIndex;
