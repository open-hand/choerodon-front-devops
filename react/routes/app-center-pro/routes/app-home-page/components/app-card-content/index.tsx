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
    mainStore,
    typeTabKeys,
  } = useAppHomePageStore();

  const {
    envName,
    envId,
    name,
    id,
    hostId,
    iamUserDTO = {},
    code,
    rdupmType,
    operationType, // 制品来源
  } = record.toData();

  const {
    imageUrl,
    creationDate,
    ldap,
    loginName,
    realName,
    email,
  } = iamUserDTO;

  const currentType = mainStore.getCurrentTypeTabKey;

  const deployTypeId = currentType === typeTabKeys.ENV_TAB ? envId : hostId;

  const history = useHistory();
  const { search, pathname } = useLocation();

  const renderAction = () => {
    const data = [
      {
        service: [],
        text: '启用',
        // action: () => handleDelete({ record: tableRecord }),
      },
      {
        service: [],
        text: '停用',
        // action: () => handleDelete({ record: tableRecord }),
      },
      {
        service: [],
        text: '删除',
        // action: () => handleDelete({ record: tableRecord }),
      },
    ];
    return <Action data={data} />;
  };

  function handleLinkToAppDetail() {
    history.push({
      pathname: `${pathname}/detail/${id}/${operationType || 'host'}/${currentType}/${deployTypeId}/success`,
      search,
    });
  }

  const renderDeployObj:any = () => {
    if (currentType === typeTabKeys.ENV_TAB) {
      return rdupmType === 'chart' ? 'Chart包' : '部署组';
    }
    return 'jar包';
  };

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
          {name || '-'}
        </span>
        <AppType type={operationType} />
      </header>
      <main>
        <div>
          <span>应用编码</span>
          <span>{code || '-'}</span>
        </div>
        <div>
          <span>部署对象</span>
          <span>{renderDeployObj()}</span>
        </div>
        <div>
          <span>主机</span>
          <span>UAT主机</span>
        </div>
        <div>
          <span>环境</span>
          <span>{envName || '-'}</span>
        </div>
        <div>
          <span>创建</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
          }}
          >
            <UserInfo avatar={imageUrl} realName={realName} loginName={ldap ? loginName : email} />
            <span>创建于</span>
            <TimePopover content={creationDate} />
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
      <CardPagination hideOnSinglePage className={`${subfixCls}-list-pagination`} dataSet={listDs as any} showFirstAndLastBtn />
    </>
  );
};

export default AppCardContent;
