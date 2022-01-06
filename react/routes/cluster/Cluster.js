import React from 'react';
import { Page, Content } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { useClusterStore } from './stores';
import MainView from './main-view';
import CustomHeader from '../../components/custom-header';

export default observer(() => {
  const { clusterStore } = useClusterStore();
  return (
    <Page service={['choerodon.code.project.deploy.cluster.cluster-management.ps.default']}>
      <CustomHeader show={!clusterStore.getNoHeader} />
      <MainView />
    </Page>
  );
});
