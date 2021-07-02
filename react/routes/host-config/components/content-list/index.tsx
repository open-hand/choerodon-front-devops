import React from 'react';
import { observer } from 'mobx-react-lite';
import HostsItem from './components/hostItem';
import { useHostConfigStore } from '../../stores';
import CardPagination from './components/CardPagination';

const ContentList: React.FC<any> = observer(({
  handleCreateTestHost,
  handleCreateDeployHost,
}): any => {
  const {
    prefixCls, intlPrefix, formatMessage, listDs, mainStore, tabKey: { DEPLOY_TAB },
  } = useHostConfigStore();

  return (
    <div className={`${prefixCls}-content-list-over ${mainStore.getCurrentTabKey === DEPLOY_TAB ? `${prefixCls}-content-list-deploy` : ''}`}>
      <div className={`${prefixCls}-content-list`}>
        {listDs.map((record) => (
          <HostsItem
            {...record.data}
            record={record}
            listDs={listDs}
            handleCreateTestHost={handleCreateTestHost}
            handleCreateDeployHost={handleCreateDeployHost}
          />
        ))}
      </div>
      <CardPagination
        className={`${prefixCls}-content-pagination`}
        dataSet={listDs}
      />
    </div>
  );
});

export default ContentList;
