/* eslint-disable max-len */
import React from 'react';
import { observer } from 'mobx-react-lite';

import {
  CardPagination,
} from '@choerodon/components';

import { Record } from '@/interface';
import { useAppHomePageStore } from '../../stores';

import './index.less';
import AppItem from './components/AppItem';

const AppCardContent = () => {
  const {
    subfixCls,
    listDs,
    refresh,
  } = useAppHomePageStore();

  const renderList = () => listDs.map((record:Record) => <AppItem refresh={refresh} subfixCls={subfixCls} record={record} key={record.id} />);

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
