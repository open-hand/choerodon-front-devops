import React from 'react';
import { observer } from 'mobx-react-lite';
import EmptyPage from '@/components/empty-page';
import Loading from '@/components/loading';
import HostsItem from './components/hostItem';
import { useHostConfigStore } from '../../stores';
import CardPagination from './components/CardPagination';

const ContentList: React.FC<any> = observer((): any => {
  const {
    prefixCls, intlPrefix, formatMessage, listDs, mainStore, tabKey: { DEPLOY_TAB },
  } = useHostConfigStore();

  if (listDs.status === 'loading' || !listDs) {
    return <Loading display />;
  }

  if (listDs && !listDs.length) {
    // @ts-ignore
    return <EmptyPage title="暂无主机" describe="项目下暂无主机，请创建" />;
  }

  return (
    <>
      <div className={`${prefixCls}-content-list ${mainStore.getCurrentTabKey === DEPLOY_TAB ? `${prefixCls}-content-list-deploy` : ''}`}>
        {listDs.map((record) => (
          <HostsItem
            {...record.data}
            record={record}
            listDs={listDs}
          />
        ))}
      </div>
      {/*<CardPagination*/}
      {/*  className={`${prefixCls}-content-pagination`}*/}
      {/*  dataSet={listDs}*/}
      {/*/>*/}
    </>
  );
});

export default ContentList;
