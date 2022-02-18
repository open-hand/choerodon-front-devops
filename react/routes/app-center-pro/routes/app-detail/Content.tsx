import { Breadcrumb, Content, Page } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { Loading } from '@choerodon/components';
import {
  JAR_TYPE,
  DOCKER_TYPE,
  OTHER_TYPE,
} from '@/routes/app-center-pro/routes/app-detail/CONSTANT';
import DetailAside from './components/detail-side';
import DetailsTabs from './components/detail-tabs';
import './index.less';
import { useAppDetailsStore } from './stores';

const AppDetail = () => {
  const { subfixCls, appDs } = useAppDetailsStore();

  const isHost = useMemo(() => {
    const data = appDs?.current?.toData();
    return [JAR_TYPE, DOCKER_TYPE, OTHER_TYPE].includes(data?.rdupmType);
  }, [appDs?.current]);

  if (appDs.status === 'loading') {
    return <Loading />;
  }

  return (
    <Page className={`${subfixCls}`}>
      <Breadcrumb title="应用详情" />
      <Content className={`${subfixCls}-content`}>
        {
          isHost ? '' : (
            <>
              <DetailAside />
              <DetailsTabs />
            </>
          )
        }
      </Content>
    </Page>
  );
};

export default observer(AppDetail);
