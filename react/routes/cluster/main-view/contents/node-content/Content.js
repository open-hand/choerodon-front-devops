/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
/* eslint-disable */
import React, {
  Fragment, lazy, Suspense, useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs, Spin } from 'choerodon-ui';
import { useNodeContentStore } from './stores';
import { useClusterMainStore } from '../../stores';
import { useClusterStore } from '../../../stores';

const { TabPane } = Tabs;

const NodeContent = lazy(() => import('./NodeContent'));
const Monitor = lazy(() => import('./monitor'));

export default observer((props) => {
  const {
    intlPrefix,
  } = useClusterMainStore();
  const {
    formatMessage,
    tabs: {
      RESOURCE_TAB,
      MONITOR_TAB,
    },
    contentStore,
  } = useNodeContentStore();
  const {
    clusterStore: { getSelectedMenu: { name } },
  } = useClusterStore();

  function handleChange(key) {
    contentStore.setTabKey(key);
  }

  return (
    <>
      <h1>{name}</h1>
      <Tabs
        animated={false}
        activeKey={contentStore.getTabKey}
        onChange={handleChange}
        className="c7ncd-cluster-tab-content"
      >
        <TabPane
          key={RESOURCE_TAB}
          tab={formatMessage({ id: 'c7ncd-clusterManagement.ResourceAllocation' })}
        >
          <Suspense fallback={<Spin />}>
            <NodeContent />
          </Suspense>
        </TabPane>
        <TabPane
          key={MONITOR_TAB}
          tab={formatMessage({ id: 'c7ncd-clusterManagement.NodeMonitor' })}
        >
          <Suspense fallback={<Spin />}>
            <Monitor />
          </Suspense>
        </TabPane>

      </Tabs>
    </>
  );
});
