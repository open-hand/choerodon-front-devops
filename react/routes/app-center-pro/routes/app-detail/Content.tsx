import { Breadcrumb, Content, Page } from '@choerodon/master';
import React from 'react';
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
        <div>
          
        </div>
        <div>

        </div>
      </Content>
    </Page>
  );
};

export default AppDetail;
