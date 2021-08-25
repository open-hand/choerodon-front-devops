import React, { Suspense, useMemo } from 'react';
import { map } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Tabs, Spin } from 'choerodon-ui/pro';
import { useAppDetailTabsStore } from './stores';

import './index.less';
import {
  APP_EVENT, HOST_RUNNING_DETAILS, POD_DETAILS, RESOURCE, RUNNING_DETAILS,
} from './stores/CONST';
import DetailsTabsHeaderButtons from './components/HeaderButtons';
import { useAppDetailsStore } from '../../stores';

const { TabPane } = Tabs;

const AppEvent = React.lazy(() => import('./components/AppEvents'));
const PodDetail = React.lazy(() => import('./components/PodsDetails'));
const RunDetails = React.lazy(() => import('./components/RunDetails'));
const ResourceConfig = React.lazy(() => import('./components/ResourceConfig'));
const RunDetailsOfHost = React.lazy(() => import('./components/RunDetailsOfHost'));

const DetailsTabs = () => {
  const {
    subfixCls,
    tabKeys,
    appDetailTabStore,
  } = useAppDetailTabsStore();

  function handleTabChange(tabKey:string) {
    appDetailTabStore.setCurrentTabKey(tabKey);
  }

  const tabContent = useMemo(() => ({
    [APP_EVENT]: <AppEvent />,
    [POD_DETAILS]: <PodDetail />,
    [RUNNING_DETAILS]: <RunDetails />,
    [RESOURCE]: <ResourceConfig />,
    [HOST_RUNNING_DETAILS]: <RunDetailsOfHost />,
  }), []);

  return (
    <div className={`${subfixCls}-tabs`}>
      <DetailsTabsHeaderButtons />
      <Tabs
        className={`${subfixCls}-tabs-content`}
        animated={false}
        activeKey={appDetailTabStore.currentTabKey}
        onChange={handleTabChange}
      >
        {map(tabKeys, (value: { name: string, key: string}, key: string) => (
          <TabPane
            key={value.key}
            tab={value.name}
          >
            <Suspense fallback={<Spin />}>
              {/* @ts-ignore */}
              {tabContent[value.key]}
            </Suspense>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default observer(DetailsTabs);
