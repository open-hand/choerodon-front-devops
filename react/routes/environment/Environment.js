import React from 'react';
import { Page, Content } from '@choerodon/master';
import CustomHeader from '../../components/custom-header';
import MainView from './main-view';
import { useEnvironmentStore } from './stores';

export default function Environment() {
  const { permissions } = useEnvironmentStore();

  return (
    <Page service={['choerodon.code.project.deploy.environment.ps.default']}>
      <CustomHeader show />
      <MainView />
    </Page>
  );
}
