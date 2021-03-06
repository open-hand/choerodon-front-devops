import React, { useCallback, useMemo } from 'react';
import map from 'lodash/map';
import {
  Progress, Tabs,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Size } from '@/interface';
import AppIngressTable from '@/components/app-ingress-table';
import { useHostConfigStore } from '@/routes/host-config/stores';
import { EmptyPage } from '@choerodon/components';
// @ts-ignore
import EmptySvg from '@/routes/host-config/images/empty-page.svg';

import './index.less';

const { TabPane } = Tabs;

const ResourceContent = observer(() => {
  const {
    intlPrefix,
    formatMessage,
    prefixCls,
    projectId,
    mainStore,
    appInstanceTableDs,
    usageDs,
  } = useHostConfigStore();

  const usageRecord = useMemo(() => usageDs.current, [usageDs.current]);

  const usageData = useMemo(() => ({
    cpu: {
      title: formatMessage({ id: `${intlPrefix}.usage.cpu` }),
      field: 'cpu',
      value: Number(usageRecord?.get('cpu') || 0),
    },
    root: {
      title: formatMessage({ id: `${intlPrefix}.usage.root` }),
      field: 'root',
      value: Number(usageRecord?.get('disk') || 0),
    },
    ram: {
      title: formatMessage({ id: `${intlPrefix}.usage.ram` }),
      field: 'root',
      value: Number(usageRecord?.get('mem') || 0),
    },
  }), [usageRecord, mainStore.getSelectedHost]);

  const getContent = useCallback(() => {
    if (mainStore.getSelectedHost?.hostStatus === 'connected') {
      return (
        <div className={`${prefixCls}-resource-tab`}>
          <Tabs defaultActiveKey="appInstance">
            <TabPane tab="应用实例" key="appInstance">
              <AppIngressTable appIngressDataset={appInstanceTableDs} />
            </TabPane>
          </Tabs>
        </div>
      );
    }
    return <EmptyPage image={EmptySvg} description="暂未获取到该主机资源信息" />;
  }, [mainStore.getSelectedHost]);

  return (
    <div className={`${prefixCls}-resource`}>
      <span className={`${prefixCls}-resource-title`}>
        {mainStore.getSelectedHost?.name}
      </span>
      <div className={`${prefixCls}-resource-usage`}>
        {map(usageData, ({ title, value }) => (
          <div className={`${prefixCls}-resource-usage-item`}>
            <span className={`${prefixCls}-resource-usage-label`}>
              {title}
              ：
            </span>
            {mainStore.getSelectedHost?.hostStatus === 'connected' ? (
              <Progress value={value} size={'small' as Size} />
            ) : '-'}
          </div>
        ))}
      </div>
      {getContent()}
    </div>
  );
});

export default ResourceContent;
