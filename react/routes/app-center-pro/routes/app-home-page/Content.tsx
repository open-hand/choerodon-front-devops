import React, { useMemo } from 'react';
import {
  Page, HeaderButtons, Header, Breadcrumb, Content, useFormatMessage,
} from '@choerodon/master';
import { get, has } from '@choerodon/inject';
import { Loading } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import EmptyPage from '@/components/empty-page';
import { openAppCreateModal } from '@/components/open-appCreate';
import './index.less';
import QueryfieldBar from './components/queryfield-bar';
import { useAppHomePageStore } from './stores';
import AppCardContent from './components/app-card-content';
import { openBatchDeploy } from '@/components/batch-deploy';
import { GetHzeroDeployBtnConfig } from '@/components/hzero-deploy';

const AppHomePage = () => {
  const {
    subfixCls,
    listDs,
    refresh,
    mainStore,
    hasMarket,
  } = useAppHomePageStore();

  const format = useFormatMessage('c7ncd.applicationCenter');

  const renderHeaderBtns = () => {
    const items = [
      {
        name: format({ id: 'CreateApplication' }),
        icon: 'playlist_add',
        handler: () => openAppCreateModal(refresh),
      },
      {
        permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.resource-batch'],
        name: format({ id: 'BatchCreateChartApplication' }),
        icon: 'library_add-o',
        handler: () => openBatchDeploy({
          refresh,
        }),
      },
      {
        icon: 'refresh',
        display: true,
        handler: () => refresh(),
      },
    ];
    if (mainStore.getHzeroSyncStatus) {
      items.splice(2, 0, {
        ...GetHzeroDeployBtnConfig({
          refresh,
          syncStatus: mainStore.getHzeroSyncStatus,
          hasMarket,
        }),
        name: format({ id: 'CreateHZEROApplication' }),
      });
    }
    if (has('base-pro:getBaseComponentDeployConfig')) {
      items.splice(2, 0, {
        ...get('base-pro:getBaseComponentDeployConfig')(refresh, false),
      });
    }
    return <HeaderButtons items={items} />;
  };

  const getContent = useMemo(() => {
    if (listDs.status === 'loading' || !listDs) {
      return <Loading display type="c7n" />;
    }
    if (listDs && !listDs.length) {
      // @ts-ignore
      return <EmptyPage title="暂无应用" describe="暂无应用，请创建" access />;
    }
    return <AppCardContent />;
  }, [listDs, listDs.length, listDs.status]);

  return (
    <Page>
      <Header>
        {renderHeaderBtns()}
      </Header>
      <Breadcrumb />
      <Content className={`${subfixCls}-content`}>
        <QueryfieldBar />
        {getContent}
      </Content>
    </Page>
  );
};

export default observer(AppHomePage);
