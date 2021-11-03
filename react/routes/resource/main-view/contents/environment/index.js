import React from 'react';
import { Permission } from '@choerodon/master';
import { StoreProvider } from './stores';
import EnvContent from './EnvContent';

const EnvIndex = (props) => (
  <Permission
    service={[
      'choerodon.code.project.deploy.app-deployment.resource.ps.gitops',
      'choerodon.code.project.deploy.app-deployment.resource.ps.deploy-config-tab',
      'choerodon.code.project.deploy.app-deployment.resource.ps.polaris',
      'choerodon.code.project.deploy.app-deployment.resource.ps.permission-allocation',
    ]}
  >
    <StoreProvider {...props}>
      <EnvContent />
    </StoreProvider>
  </Permission>
);

export default EnvIndex;
