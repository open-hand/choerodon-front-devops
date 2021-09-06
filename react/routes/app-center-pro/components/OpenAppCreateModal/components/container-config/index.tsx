import React from 'react';
import { CONSTANTS } from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';
import { StoreProvider } from './stores';
import Content from './content';

const ContainerConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default ContainerConfig;
