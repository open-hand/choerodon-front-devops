import React from 'react';
import { Loading, EmptyPage } from '@choerodon/components';
import { observer } from 'mobx-react-lite';
import NoData from '@/routes/app-center-pro/assets/nodata.png';
import ConfigItem from './components/ConfigItem';
import { useAppDetailTabsStore } from '../../stores';
import './index.less';

const ResourceConfig = () => {
  const {
    subfixCls,
    resourceConfigDs,
  } = useAppDetailTabsStore();

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
    return resourceConfigDs.map((record:any) => <ConfigItem data={record.toData()} subfixCls={subfixCls} key={record.get('id')} />);
  };

  if (resourceConfigDs.status === 'loading') {
    return <Loading />;
  }

  return (
    <div className={`${subfixCls}-resourceConfig`}>
      {getContent()}
    </div>
  );
};

export default observer(ResourceConfig);
