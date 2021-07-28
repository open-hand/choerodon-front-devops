import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { CardPagination } from '@choerodon/components';
import HostItemServices from '@/routes/host-config/components/content-list/components/hostItem/services';
import HostsItem from './components/hostItem';
import { useHostConfigStore } from '../../stores';

const ContentList: React.FC<any> = observer(({
  handleCreateDeployHost,
}): any => {
  const {
    prefixCls, listDs, projectId, mainStore,
  } = useHostConfigStore();

  useEffect(() => {
    HostItemServices.axiosGetHostDisconnect(projectId).then((res: string) => {
      mainStore.setDisConnectCommand(res);
    });
  }, []);

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
