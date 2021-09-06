import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { StoreProvider } from './stores';
import Content from './content';
import AppConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config';

const DeployGroupConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default DeployGroupConfig;
