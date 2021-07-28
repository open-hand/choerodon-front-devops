import React from 'react';
import { observer } from 'mobx-react-lite';
import { CardPagination } from '@choerodon/components';
import HostsItem from './components/hostItem';
import { useHostConfigStore } from '../../stores';

const ContentList: React.FC<any> = observer(({
  handleCreateDeployHost,
}): any => {
  const {
    prefixCls, listDs,
  } = useHostConfigStore();

  return (
    <div className={`${prefixCls}-content-list-over ${prefixCls}-content-list-deploy`}>
      <div className={`${prefixCls}-content-list`}>
        {listDs.map((record) => (
          <HostsItem
            {...record.data}
            record={record}
            listDs={listDs}
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
