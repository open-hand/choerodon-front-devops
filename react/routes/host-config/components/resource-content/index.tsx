/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
import React, { useCallback, useMemo } from 'react';
import map from 'lodash/map';
import {
  Progress, Tabs,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { EmptyPage } from '@choerodon/components';
import { Size } from '@/interface';
import AppIngressTable from '@/components/app-ingress-table';
import { useHostConfigStore } from '@/routes/host-config/stores';
// @ts-ignore
import EmptySvg from '@/routes/host-config/images/empty-page.svg';
import PermissionTable from './PermissionTable';

import './index.less';

const { TabPane } = Tabs;

const ResourceContent = observer(() => {
  const {
    intlPrefix,
    formatMessage,
    prefixCls,
    mainStore,
    appInstanceTableDs,
    usageDs,
  } = useHostConfigStore();

  const usageRecord = useMemo(() => usageDs.current, [usageDs.current]);

  const usageData = useMemo(() => ({
    cpu: {
      title: formatMessage({ id: 'c7ncd.environment.CPUUsage' }),
      field: 'cpu',
      value: Number(usageRecord?.get('cpu') || 0),
    },
    root: {
      title: formatMessage({ id: 'c7ncd.environment.RootPartitionUsage' }),
      field: 'root',
      value: Number(usageRecord?.get('disk') || 0),
    },
    ram: {
      title: formatMessage({ id: 'c7ncd.environment.MemoryUsage' }),
      field: 'root',
      value: Number(usageRecord?.get('mem') || 0),
    },
  }), [usageRecord, mainStore.getSelectedHost]);

  const getContent = useCallback(() => (
    <div className={`${prefixCls}-resource-tab`}>
      <Tabs defaultActiveKey="appInstance">
        <TabPane tab={formatMessage({ id: 'c7ncd.environment.Application' })} key="appInstance">
          {mainStore.getSelectedHost?.hostStatus === 'connected' ? (
            <AppIngressTable appIngressDataset={appInstanceTableDs} />
          ) : (
            <EmptyPage image={EmptySvg} description="暂未获取到该主机资源信息" />
          )}
        </TabPane>
        {mainStore.getSelectedHost?.permissionLabel === 'administrator' ? (
          <TabPane
            tab={formatMessage({ id: 'c7ncd.environment.AuthorityManagement' })}
            key="permission"
          >
            <PermissionTable />
          </TabPane>
        ) : null}
      </Tabs>
    </div>
  ), [mainStore.getSelectedHost]);

  return (
    <div className={`${prefixCls}-resource`}>
      <span className={`${prefixCls}-resource-title`}>
        {mainStore.getSelectedHost?.name}
      </span>
      <div className={`${prefixCls}-resource-usage`}>
        {map(usageData, ({ title, value }) => {
          console.log(title + value);
          return (
            <div className={`${prefixCls}-resource-usage-item`}>
              <span className={`${prefixCls}-resource-usage-label`}>
                {title}
                ：
              </span>
              {mainStore.getSelectedHost?.hostStatus === 'connected' ? (
                <Progress
                  value={value}
                  size={'small' as Size}
                  // @ts-ignore
                  format={(percent) => `${percent}%`}
                />
              ) : '-'}
            </div>
          );
        })}
      </div>
      {getContent()}
    </div>
  );
});

export default ResourceContent;
