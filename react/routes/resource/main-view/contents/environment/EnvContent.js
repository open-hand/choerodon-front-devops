/* eslint-disable react/jsx-no-bind */
import React, { lazy, Suspense, useEffect } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Tabs, Spin } from 'choerodon-ui';
import { Permission } from '@choerodon/master';
import { useEnvironmentStore } from './stores';
import { useResourceStore } from '../../../stores';
import PageTitle from '../../../../../components/page-title';
import EnvItem from '../../../../../components/env-item';
import openWarnModal from '../../../../../utils/openWarnModal';
import Modals from './modals';
import Tips from '../../../../../components/new-tips';
import Config from './DeployConfig';

const { TabPane } = Tabs;

const SyncSituation = lazy(() => import('./sync-situation'));
const Permissions = lazy(() => import('./Permissions'));
const Polaris = lazy(() => import('./polaris'));

const EnvContent = observer(() => {
  const {
    prefixCls,
    intlPrefix,
    treeDs,
    resourceStore,
  } = useResourceStore();

  const {
    intl: { formatMessage },
    baseInfoDs,
    tabs: {
      SYNC_TAB,
      CONFIG_TAB,
      ASSIGN_TAB,
      POLARIS_TAB,
    },
    envStore,
  } = useEnvironmentStore();

  function handleChange(key) {
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
      const menuItem = treeDs.find((item) => item.get('key') === String(id));
      if (menuItem) {
        // 清除已经停用的环境
        if (!active) {
          openWarnModal(refresh, formatMessage);
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
            <Tips
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
      {/* <Modals /> */}
    </div>
  );
});

export default EnvContent;
