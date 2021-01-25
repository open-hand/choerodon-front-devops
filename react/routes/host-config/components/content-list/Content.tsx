import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Pagination, Spin,
} from 'choerodon-ui/pro';
import EmptyPage from '@/components/empty-page';
import Loading from '@/components/loading';
import ScrollContext from 'react-infinite-scroll-component';
import HostsItem from './components/hostItem';
import { useHostConfigStore } from '../../stores';

const ContentList: React.FC<any> = observer((): any => {
  const {
    prefixCls, intlPrefix, formatMessage, listDs, mainStore,
  } = useHostConfigStore();

  const {
    getListHasMore,
  } = mainStore;

  useEffect(() => {
  }, []);

  async function loadMore() {
    await listDs.query(listDs.currentPage + 1);
  }

  if (listDs.status !== 'loading' && !listDs.length) {
    // @ts-ignore
    return <EmptyPage title="暂无主机" describe="项目下暂无主机，请创建" />;
  }

  return (
    <>
      <Spin spinning={listDs.status === 'loading'}>
        <ScrollContext
          className={`${prefixCls}-content-list`}
          dataLength={listDs.length}
          next={loadMore}
          hasMore={getListHasMore}
          height={441}
          loader={false}
        >
          {listDs.map((record) => (
            <HostsItem
              {...record.data}
              record={record}
              listDs={listDs}
            />
          ))}
        </ScrollContext>
      </Spin>
    </>
  );
});

export default ContentList;
