import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';
import {
  AppPipelineEditIndexProps,
} from './interface';
import './index.less';

const AppPipelineEditIndex = (props: AppPipelineEditIndexProps) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default AppPipelineEditIndex;
