/* eslint-disable react-hooks/exhaustive-deps */
import React, { Suspense, useMemo } from 'react';
import { map } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Tabs, Spin } from 'choerodon-ui/pro';
import { useParams } from 'react-router';
import { useAppDetailTabsStore } from './stores';
import { useAppDetailsStore } from '../../stores';
// import ConfigurationModal from '@/components/configuration-center/ConfigurationModal';

import './index.less';
import {
  APP_EVENT,
  HOST_RUNNING_DETAILS,
  POD_DETAILS,
  RESOURCE,
  RUNNING_DETAILS,
  APPMONITOR,
//   PROFILE_DETAILS,
} from './stores/CONST';
import DetailsTabsHeaderButtons from './components/HeaderButtons';
import DockerComposeDetail from './components/DockerComposeDetail';

const { TabPane } = Tabs;

const AppEvent = React.lazy(() => import('./components/AppEvents'));
const PodDetail = React.lazy(() => import('./components/PodsDetails'));
const RunDetails = React.lazy(() => import('./components/RunDetails'));
const ResourceConfig = React.lazy(() => import('./components/ResourceConfig'));
const RunDetailsOfHost = React.lazy(() => import('./components/RunDetailsOfHost'));
const AppMonitor = React.lazy(() => import('@/components/AppMonitor'));

const DetailsTabs = () => {
  const {
    subfixCls,
    tabKeys,
    // configurationDetailDataSet,
    instanceId,
  } = useAppDetailTabsStore();
  const {
    appDs,
    enableAppMonitor,
    appDetailTabStore,
  } = useAppDetailsStore();

  const {
    rdupmType,
    appId,
  } = useParams<any>();
  const monitorData = {
    enableAppMonitor, appDs, appId,
  };
  const handleTabChange = (tabKey: string) => {
    appDetailTabStore.setCurrentTabKey(tabKey);
  };

  const tabContent = useMemo(
    () => ({
      [APP_EVENT]: <AppEvent />,
      [POD_DETAILS]: <PodDetail />,
      [RUNNING_DETAILS]: <RunDetails />,
      [RESOURCE]: <ResourceConfig />,
      [HOST_RUNNING_DETAILS]: <RunDetailsOfHost />,
      [APPMONITOR]: <AppMonitor {...monitorData} />, // 应用监控
    //   [PROFILE_DETAILS]: (
    //     <ConfigurationModal
    //       // @ts-ignore
    //       configurationDetailDataSet={configurationDetailDataSet}
    //       id={instanceId}
    //       kind="hostDetail"
    //     />
    //   ),
    }),
    [instanceId],
  );

  return (
    <div className={`${subfixCls}-tabs`}>
      <DetailsTabsHeaderButtons />
      {
        rdupmType === 'docker_compose' ? (
          <DockerComposeDetail
            id={appId}
          />
        ) : (
          <Tabs
            className={`${subfixCls}-tabs-content`}
            animated={false}
            activeKey={appDetailTabStore.currentTabKey}
            onChange={handleTabChange}
          >
            {map(tabKeys, (value: { name: string; key: string }, key: string) => (
              <TabPane key={value.key} tab={value.name}>
                <Suspense fallback={<Spin />}>
                  {/* @ts-ignore */}
                  {tabContent[value.key]}
                </Suspense>
              </TabPane>
            ))}
          </Tabs>
        )
      }
    </div>
  );
};

export default observer(DetailsTabs);
