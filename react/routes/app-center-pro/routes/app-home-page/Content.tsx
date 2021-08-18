import React, { useEffect, useMemo } from 'react';
import {
  Page, HeaderButtons, Header, Breadcrumb, Content,
} from '@choerodon/boot';
import EmptyPage from '@/components/empty-page';
import { Loading } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { openAppCreateModal } from '../../components/OpenAppCreateModal';
import './index.less';
import QueryfieldBar from './components/queryfield-bar';
import { useAppHomePageStore } from './stores';
import AppCardContent from './components/app-card-content';

const AppHomePage = () => {
  const {
    subfixCls,
    mainStore,
    listDs,
  } = useAppHomePageStore();

  useEffect(() => {

  }, []);

  const renderHeaderBtns = () => {
    const items = [
      {
        name: '创建应用',
        icon: 'playlist_add',
        handler: openAppCreateModal,
        // display: !isHost,
      },
      {
        icon: 'refresh',
        display: true,
        // handler: refresh,
      },
    ];
    return <HeaderButtons items={items} />;
  };

  const getContent = useMemo(() => {
    if (listDs.status === 'loading' || !listDs) {
      return <Loading display />;
    }
    if (listDs && !listDs.length) {
      // @ts-expect-error
      return <EmptyPage title="暂无数据" describe="暂无应用服务，请关联应用服务" access />;
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
