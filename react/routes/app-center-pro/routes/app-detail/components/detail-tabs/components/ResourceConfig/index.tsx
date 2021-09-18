import React from 'react';
import { Loading } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import { Pagination } from 'choerodon-ui/pro';
import ConfigItem from './components/ConfigItem';
import { useAppDetailTabsStore } from '../../stores';
import './index.less';
import { useAppDetailsStore } from '../../../../stores';
import TabEmptyPage from '../TabEmptyPage';

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
        <TabEmptyPage text="当前应用下暂无网络配置信息" />
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
