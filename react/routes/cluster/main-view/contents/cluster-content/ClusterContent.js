import React, {
  lazy, Suspense,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs, Spin } from 'choerodon-ui';
import { NewTips } from '@choerodon/components';
import { useClusterContentStore } from './stores';
import Modals from './modals';
import PageTitle from '../../../../../components/page-title';
import StatusDot from '../../../../../components/status-dot';

import './index.less';

const { TabPane } = Tabs;

const NodeList = lazy(() => import('./node-list'));
const PermissionList = lazy(() => import('./permission-list'));
const Monitor = lazy(() => import('./monitor'));
const ComponentManage = lazy(() => import('./component-manage'));
const Polaris = lazy(() => import('./polaris'));

export default observer((props) => {
  const {
    intlPrefix,
    intl: { formatMessage },
    tabs: {
      NODE_TAB,
      ENV_TAB,
      POLARIS_TAB,
      ASSIGN_TAB,
      COMPONENT_TAB,
      MONITOR_TAB,
    },
    contentStore,
    ClusterDetailDs,
  } = useClusterContentStore();
  const handleChange = (key) => {
    contentStore.setTabKey(key);
  };

  function title() {
    const record = ClusterDetailDs.current;
    if (record) {
      const name = record.get('name');
      const getStatus = () => {
        const tempStatus = record.get('status');
        switch (tempStatus) {
          case 'running':
            return ['running', 'connect'];
          case 'failed':
            return ['failed', 'failed'];
          case 'operating':
            return ['operating', 'operating'];
          default:
            break;
        }
        return ['disconnect'];
      };

      return (
        <>
          <StatusDot
            getStatus={getStatus}
          />
          <span className="c7ncd-page-title-text">{name}</span>
        </>
      );
    }
    return null;
  }

  return (
    <>
      <Modals />
      <PageTitle content={title()} />
      <Tabs
        animated={false}
        activeKey={contentStore.getTabKey}
        onChange={handleChange}
        className="c7ncd-cluster-tab-content"
      >
        <TabPane
          key={NODE_TAB}
          tab={formatMessage({ id: 'c7ncd-clusterManagement.NodeList' })}
        >
          <Suspense fallback={<Spin />}>
            <div className="c7ncd-cluster-node-list">
              <NodeList />
            </div>
          </Suspense>
        </TabPane>
        <TabPane
          key={POLARIS_TAB}
          tab={formatMessage({ id: 'c7ncd-clusterManagement.HealthCheck' })}
        >
          <Suspense fallback={<Spin />}>
            <Polaris />
          </Suspense>
        </TabPane>
        <TabPane
          key={ASSIGN_TAB}
          tab={(
            <NewTips
              helpText={formatMessage({ id: `${intlPrefix}.permission.tab.tips` })}
              title={formatMessage({ id: 'c7ncd-clusterManagement.PermissionAssignment' })}
            />
          )}
        >
          <Suspense fallback={<Spin />}>
            <PermissionList />
          </Suspense>
        </TabPane>
        <TabPane
          key={COMPONENT_TAB}
          tab={formatMessage({ id: 'c7ncd-clusterManagement.ComponentManagement' })}
        >
          <Suspense fallback={<Spin />}>
            <ComponentManage />
          </Suspense>
        </TabPane>
        <TabPane
          key={MONITOR_TAB}
          tab={formatMessage({ id: 'c7ncd-clusterManagement.ClusterMonitor' })}
        >
          <Suspense fallback={<Spin />}>
            <Monitor />
          </Suspense>
        </TabPane>
      </Tabs>
    </>
  );
});
