import React, {
  lazy, Suspense, memo, useEffect, useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Icon, Spin } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import map from 'lodash/map';
import ResourceListTitle from '@/routes/resource/main-view/components/resource-list-title';
import { useWorkloadStore } from './stores';
import { useResourceStore } from '../../../stores';
import Modals from './modals';

// import './index.less';

const { TabPane } = Tabs;
const { Column } = Table;

const WorkloadContent = observer(() => {
  const {
    tabs: {
      DAEMONSET_TAB,
      DEPLOYMENT_TAB,
      STATEFULSET,
      JOB_TAB,
      CRONJOB_TAB,
    },
    workloadStore,
    tableDs,
  } = useWorkloadStore();
  const {
    prefixCls,
    intlPrefix,
    resourceStore,
    treeDs,
    intl: { formatMessage },
  } = useResourceStore();
  const { getSelectedMenu: { key: selectedKey } } = resourceStore;

  const handleTabChange = useCallback((tabKey: string) => {
    workloadStore.setTabKey(tabKey);
  }, []);

  return (
    <div className={`${prefixCls}-workload`}>
      <Modals />
      <ResourceListTitle type="workload" />
      <Tabs
        className={`${prefixCls}-workload-tabs`}
        animated={false}
        activeKey={workloadStore.getTabKey}
        onChange={handleTabChange}
      >
        {map([DEPLOYMENT_TAB, DAEMONSET_TAB, STATEFULSET, JOB_TAB, CRONJOB_TAB], (item: string) => (
          <TabPane
            key={item}
            tab={item}
          />
        ))}
      </Tabs>
      <div className="c7ncd-tab-table">
        <Table dataSet={tableDs}>
          <Column name="name" />
          <Column name="pod" />
          <Column name="label" />
          <Column name="port" />
          <Column name="resource" />
          <Column name="lastUpdateDate" />
        </Table>
      </div>
    </div>
  );
});

export default WorkloadContent;
