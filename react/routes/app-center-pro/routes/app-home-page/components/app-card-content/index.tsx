/* eslint-disable max-len */
import React from 'react';
import { Record } from '@/interface';
import { Action } from '@choerodon/master';
import { useHistory, useLocation } from 'react-router';
import { UserInfo, TimePopover, CardPagination } from '@choerodon/components';
import AppType from '@/routes/app-center-pro/components/AppType';
import { useAppHomePageStore } from '../../stores';
import './index.less';

const AppItem = ({
  record,
  subfixCls,
}: {
  record: Record
  subfixCls:string
}) => {
  const {

  } = record.toData();

  const history = useHistory();
  const { search, pathname } = useLocation();

  const renderAction = () => <Action />;

  function handleLinkToAppDetail() {
    history.push({
      pathname: `${pathname}/detail/123456/market/env/success`,
      search,
    });
  }

  return (
    <div className={`${subfixCls}-list-card`}>
      <aside>
        {renderAction()}
      </aside>
      <header>
        <span
          role="none"
          onClick={handleLinkToAppDetail}
          className={`${subfixCls}-list-card-appname`}
        >
          DevOps服务
        </span>
        <AppType type="hzero" />
      </header>
      <main>
        <div>
          <span>应用编码</span>
          <span>devops-app</span>
        </div>
        <div>
          <span>部署对象</span>
          <span>Chart包</span>
        </div>
        <div>
          <span>主机</span>
          <span>UAT主机</span>
        </div>
        <div>
          <span>环境</span>
          <span>Prod环境</span>
        </div>
        <div>
          <span>创建</span>
          <div>
            <UserInfo realName="wengkaimin" />
            <span />
            <TimePopover content="" />
          </div>
        </div>
      </main>
    </div>
  );
};

const AppCardContent = () => {
  const {
    subfixCls,
    listDs,
  } = useAppHomePageStore();

  const renderList = () => listDs.map((record:Record) => <AppItem subfixCls={subfixCls} record={record} key={record.id} />);

  return (
    <>
      <div className={`${subfixCls}-list`}>
        {
          renderList()
        }
      </div>
      <CardPagination hideOnSinglePage className={`${subfixCls}-list-pagination`} dataSet={listDs} showFirstAndLastBtn />
    </>
  );
};

export default AppCardContent;
