import React from 'react';
import PermissionHOC from '@/components/page-permission';
import { StoreProvider } from './stores';
import Content from './Content';

export default PermissionHOC([
  'choerodon.code.organization.manager.application-template.ps.default',
])((props: any) => (
  <StoreProvider {...props} pageType="organization">
    <Content />
  </StoreProvider>
));
