/* eslint-disable max-len */
import React from 'react';
import { Action } from '@choerodon/master';
import { observer } from 'mobx-react-lite';

import { useHistory, useLocation } from 'react-router';
import { UserInfo, TimePopover, CardPagination } from '@choerodon/components';
import { Record } from '@/interface';

import AppType from '@/routes/app-center-pro/components/AppType';
import { useAppHomePageStore } from '../../stores';
import './index.less';
import { getAppCategories } from '@/routes/app-center-pro/utils';
import { CHART_HOST } from '@/routes/app-center-pro/stores/CONST';

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
    name,
    id,

    envName,
    envId,

    hostId,
    hostName,

    creator = {},

    code,
    rdupmType, // 部署对象
    operationType, // 操作类型
    chartSource, // 制品来源

    status, // 应用状态
  } = record.toData();

  const {
    imageUrl,
    creationDate,
    ldap,
    loginName,
    realName,
    email,
  } = creator;

  const currentType = mainStore.getCurrentTypeTabKey;

  const isEnv = currentType === typeTabKeys.ENV_TAB;

  const isHost = currentType === typeTabKeys.HOST_TAB;

  const deployTypeId = isEnv ? envId : hostId;

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
      pathname: `${pathname}/detail/${id}/${chartSource || CHART_HOST}/${currentType}/${deployTypeId}/${rdupmType}/${status}`,
      search,
    });
  }

  const catergory = getAppCategories(rdupmType, currentType);

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
          <span>{catergory.name}</span>
        </div>
        {isHost && (
        <div>
          <span>主机</span>
          <span>{hostName}</span>
        </div>
        )}
        {
          isEnv && (
          <div>
            <span>环境</span>
            <span>{envName || '-'}</span>
          </div>
          )
        }
        <div>
          <span>创建</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
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

export default observer(AppCardContent);
