import React from 'react';
import { Permission } from '@choerodon/master';
import { StoreProvider } from './stores';
import Content from './Content';

export default (props: any) => (
  <Permission
    service={[]}
  >
    <StoreProvider {...props}>
      <Content />
    </StoreProvider>
  </Permission>
);
