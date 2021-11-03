import React from 'react';
import { Permission } from '@choerodon/master';
import { StoreProvider } from './stores';
import InstanceContent from './InstanceContent';

const index = (props) => (
  <Permission
    service={[
      'choerodon.code.project.deploy.app-deployment.resource.ps.events-tab',
      'choerodon.code.project.deploy.app-deployment.resource.ps.runningdetail-tab',
      'choerodon.code.project.deploy.app-deployment.resource.ps.poddetail-tab',
    ]}
  >
    <StoreProvider {...props}>
      <InstanceContent />
    </StoreProvider>
  </Permission>
);
export default index;
