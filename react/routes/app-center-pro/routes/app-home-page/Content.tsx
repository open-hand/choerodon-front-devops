import React, { useEffect } from 'react';
import {
  Page, HeaderButtons, Header, Breadcrumb, Content,
} from '@choerodon/boot';
import { openAppCreateModal } from '../../components/OpenAppCreateModal';
import './index.less';
import { useAppHomePageStore } from './stores';

const AppHomePage = () => {
  const {
    prefixCls,
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

  return (
    <Page>
      <Header>
        {renderHeaderBtns()}
      </Header>
      <Breadcrumb />

      <Content>
        hellowrold
      </Content>
    </Page>
  );
};

export default AppHomePage;
