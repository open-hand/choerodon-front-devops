/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import { DataSet } from '@/interface';
import Content from './Content';
import { StoreProvider } from './stores';

export default (props: {
  appIngressDataset: DataSet,
  [field:string]: any,
}) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
