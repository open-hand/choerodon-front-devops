import React, { lazy, Suspense, useEffect } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Tabs, Spin } from 'choerodon-ui';
import { NewTips } from '@choerodon/components';
import { useResourceStore } from '@/routes/resource/stores';
import openWarnModal from '@/utils/openWarnModal';
import { useREStore } from '../../stores';

const { TabPane } = Tabs;

const SyncSituation = lazy(() => import('./components/sync-situation'));
const Permissions = lazy(() => import('./components/permission'));
const Polaris = lazy(() => import('./components/polaris'));
const Config = lazy(() => import('./components/deploy-config'));

const EnvContent = observer(() => {
  const {
    prefixCls,
    intlPrefix,
    treeDs,
    resourceStore,
    formatMessage,
  } = useResourceStore();

  const {
    baseInfoDs,
    tabs: {
      SYNC_TAB,
      CONFIG_TAB,
      ASSIGN_TAB,
      POLARIS_TAB,
    },
    tabs,
    envStore,
  } = useREStore();

  function handleChange(key:any) {
    envStore.setTabKey(key);
  }

  function refresh() {
    treeDs.query();
  }

  function getCurrent() {
    const record = baseInfoDs.current;
    if (record) {
      const id = record.get('id');
      const name = record.get('name');
      const active = record.get('active');
      const connect = record.get('connect');
      const clusterName = record.get('clusterName');
      return {
        id, name, active, connect, clusterName,
      };
    }
    return null;
  }

  useEffect(() => {
    const currentBase = getCurrent();
    if (currentBase) {
      const {
        id, name, active, connect,
      } = currentBase;
      const menuItem = treeDs.find((item:any) => item.get('key') === String(id));
      if (menuItem) {
        // 清除已经停用的环境
        if (!active) {
          openWarnModal(refresh);
        } else if ((menuItem.get('connect') !== connect
          || menuItem.get('name') !== name)) {
          runInAction(() => {
            menuItem.set({ name, connect });
            resourceStore.setSelectedMenu({
              ...resourceStore.getSelectedMenu,
              name,
              connect,
            });
          });
        }
      }
    }
  });

  return (
    <div className={`${prefixCls}-environment`}>
      <Tabs
        animated={false}
        activeKey={envStore.getTabKey}
        onChange={handleChange}
      >
        <TabPane
          key={SYNC_TAB}
          tab={formatMessage({ id: `${intlPrefix}.environment.tabs.sync` })}
        >
          <Suspense fallback={<Spin />}>
            <SyncSituation />
          </Suspense>
        </TabPane>
        <TabPane
          key={CONFIG_TAB}
          tab={formatMessage({ id: `${intlPrefix}.environment.tabs.config` })}
        >
          <Suspense fallback={<Spin />}>
            <Config />
          </Suspense>
        </TabPane>
        <TabPane
          key={POLARIS_TAB}
          tab={formatMessage({ id: `${intlPrefix}.environment.tabs.polaris` })}
        >
          <Suspense fallback={<Spin />}>
            <Polaris />
          </Suspense>
        </TabPane>
        {envStore.getPermission && (
        <TabPane
          key={ASSIGN_TAB}
          tab={(
            <NewTips
              helpText={formatMessage({ id: `${intlPrefix}.permission.tab.tips` })}
              title={formatMessage({ id: `${intlPrefix}.environment.tabs.assignPermissions` })}
            />
          )}
        >
          <Suspense fallback={<Spin />}>
            <Permissions />
          </Suspense>
        </TabPane>
        )}
      </Tabs>
    </div>
  );
});

export default EnvContent;
