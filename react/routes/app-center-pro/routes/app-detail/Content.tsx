import { Breadcrumb, Content, Page } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Loading } from '@choerodon/components';
import DetailAside from './components/detail-side';
import DetailsTabs from './components/detail-tabs';
import './index.less';
import { useAppDetailsStore } from './stores';

const AppDetail = () => {
  const { subfixCls, appDs } = useAppDetailsStore();

  if (appDs.status === 'loading') {
    return <Loading />;
  }

  return (
    <Page className={`${subfixCls}`}>
      <Breadcrumb title="应用详情" />
      <Content className={`${subfixCls}-content`}>
        <DetailAside />
        <DetailsTabs instanceId={appDs.current?.get('instanceId')} />
      </Content>
    </Page>
  );
};

export default observer(AppDetail);
