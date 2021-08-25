import React from 'react';
import { Loading, EmptyPage } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { Pagination } from 'choerodon-ui/pro';
import NoData from '@/routes/app-center-pro/assets/nodata.png';
import ConfigItem from './components/ConfigItem';
import { useAppDetailTabsStore } from '../../stores';
import './index.less';
import { useAppDetailsStore } from '../../../../stores';

const ResourceConfig = () => {
  const {
    appDs,
  } = useAppDetailsStore();

  const {
    subfixCls,
    resourceConfigDs,
    formatMessage,
  } = useAppDetailTabsStore();

  const connect = appDs.current?.get('envConnected');

  const getContent = () => {
    if (!resourceConfigDs.length) {
      return (
        <EmptyPage
          image={NoData}
          description={(
            <>
              当前应用下暂无资源配置信息
            </>
          )}
        />
      );
    }
    return resourceConfigDs.map((record:any) => <ConfigItem connect={connect} formatMessage={formatMessage} data={record.toData()} subfixCls={subfixCls} key={record.get('id')} />);
  };

  if (resourceConfigDs.status === 'loading') {
    return <Loading />;
  }

  return (
    <div className={`${subfixCls}-resourceConfig`}>
      {getContent()}
      <Pagination hideOnSinglePage dataSet={resourceConfigDs} className={`${subfixCls}-resourceConfig-page`} />
    </div>
  );
};

export default observer(ResourceConfig);
