import React from 'react';
import PermissionHOC from '@/components/page-permission';
import { StoreProvider } from './stores';
import Content from './Content';

export default PermissionHOC([
  'choerodon.code.site.manager.application-template.ps.default',
])((props: any) => (
  <StoreProvider {...props} pageType="site">
    <Content />
  </StoreProvider>
));
