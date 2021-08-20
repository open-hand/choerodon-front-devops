import { Breadcrumb, Content, Page } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import React from 'react';
import DetailAside from './components/detail-side';
import DetailsTabs from './components/detail-tabs';
import './index.less';
import { useAppDetailsStore } from './stores';

const AppDetail = () => {
  const {
    subfixCls,
  } = useAppDetailsStore();

  return (
    <Page className={`${subfixCls}`}>
      <Breadcrumb title="应用详情" />
      <Content className={`${subfixCls}-content`}>
        <DetailAside />
        <DetailsTabs />
      </Content>
    </Page>
  );
};

export default observer(AppDetail);
