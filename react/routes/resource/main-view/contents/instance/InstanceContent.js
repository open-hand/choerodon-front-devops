/* eslint-disable react/jsx-no-bind */
import React, {
  Fragment, lazy, Suspense, useEffect, useMemo,
} from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useFormatMessage } from '@choerodon/master';
import {
  Tooltip,
} from 'choerodon-ui/pro';
import {
  Tabs, Spin,
} from 'choerodon-ui';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import PageTitle from '../../../../../components/page-title';
import PodCircle from '../../../../../components/pod-circle';
import Modals from './modals';
import { useResourceStore } from '../../../stores';
import { useMainStore } from '../../stores';
import { useInstanceStore } from './stores';

import './index.less';

const { TabPane } = Tabs;

const Cases = lazy(() => import('./cases'));
const Details = lazy(() => import('./details'));
const PodsDetails = lazy(() => import('./pods-details'));

const InstanceTitle = ({
  podRunningCount,
  podUnlinkCount,
  status,
  name,
  versionName,
  formatMessage,
  commandStatus,
}) => {
  const podSize = useMemo(() => ({
    width: 22,
    height: 22,
  }), []);
  const {
    podColor: {
      RUNNING_COLOR,
      PADDING_COLOR,
    },
  } = useMainStore();

  function getVersionName() {
    let message = '';
    switch (status) {
      case 'failed':
        message = formatMessage({ id: 'deploy_failed' });
        break;
      case 'operating':
        message = formatMessage({ id: 'pending' });
        break;
      default:
        break;
    }
    return message;
  }

  return (
    <>
      {commandStatus === 'operating' ? (
        <Spin className="c7ncd-deployment-instance-spin" />
      ) : (
        <PodCircle
          style={podSize}
          dataSource={[{
            name: 'running',
            value: podRunningCount,
            stroke: RUNNING_COLOR,
          }, {
            name: 'unlink',
            value: podUnlinkCount,
            stroke: PADDING_COLOR,
          }]}
        />
      )}
      <span className="c7ncd-page-title-text">{name}</span>
      <Tooltip title={versionName || getVersionName()}>
        <span className="c7ncd-page-title-version">
          (
          {versionName || getVersionName()}
          )
        </span>
      </Tooltip>
    </>
  );
};

const InstanceContent = observer(() => {
  const {
    prefixCls,
    intlPrefix,
    resourceStore,
    treeDs,
  } = useResourceStore();
  const {
    intl: { formatMessage },
    tabs: {
      CASES_TAB,
      DETAILS_TAB,
      PODS_TAB,
    },
    istStore,
    baseDs,
  } = useInstanceStore();
  const viewType = resourceStore.getViewType;

  const format = useFormatMessage('c7ncd.resource');

  const { getSelectedMenu: { key: selectedKey } } = resourceStore;

  function handleChange(key) {
    istStore.setTabKey(key);
  }

  function getCurrent() {
    const record = baseDs.current;
    if (record) {
      const id = record.get('id');
      const status = record.get('status');
      const name = record.get('name');
      const podRunningCount = record.get('podRunningCount');
      const podCount = record.get('podCount');
      const error = record.get('error');
      const versionName = record.get('effectCommandVersion');
      const commandStatus = record.get('commandStatus');
      return {
        id,
        status,
        name,
        podRunningCount,
        podCount,
        error,
        versionName,
        commandStatus,
      };
    }

    return null;
  }

  useEffect(() => {
    const current = getCurrent();
    if (current) {
      const menuItem = treeDs.find((item) => item.get('key') === selectedKey && item.get('id') === current.id);
      if (menuItem) {
        const previous = pick(menuItem.toData(), ['status', 'name', 'podRunningCount', 'podCount']);
        const next = pick(current, ['status', 'name', 'podRunningCount', 'podCount']);

        if (!isEqual(previous, next)) {
          runInAction(() => {
            menuItem.set(next);
            resourceStore.setSelectedMenu({
              ...resourceStore.getSelectedMenu,
              ...next,
            });
          });
        }
      }
    }
  });

  function getTitle() {
    const current = getCurrent();
    if (current) {
      const {
        status,
        name,
        podRunningCount,
        podCount,
        error,
        versionName,
        commandStatus,
      } = current;
      const podUnlinkCount = computeUnlinkPod(podCount, podRunningCount);
      return (
        <InstanceTitle
          status={status}
          commandStatus={commandStatus}
          name={name}
          podRunningCount={podRunningCount}
          podUnlinkCount={podUnlinkCount}
          errorText={error}
          versionName={versionName}
          formatMessage={formatMessage}
        />
      );
    }
    return null;
  }

  function getFallBack() {
    const {
      name,
      podRunningCount,
      podCount,
    } = resourceStore.getSelectedMenu;

    const podUnlinkCount = computeUnlinkPod(podCount, podRunningCount);

    return (
      <InstanceTitle
        name={name}
        podRunningCount={podRunningCount}
        podUnlinkCount={podUnlinkCount}
      />
    );
  }
  function chooseTab() {
    const detailsTab = (
      <TabPane
        key={DETAILS_TAB}
        tab={format({ id: 'OperationDetails' })}
      >
        <Suspense fallback={<Spin />}>
          <Details />
        </Suspense>
      </TabPane>
    );
    const casesTab = (
      <TabPane
        key={CASES_TAB}
        tab={format({ id: 'ApplicationEvent' })}
      >
        <Suspense fallback={<Spin />}>
          <Cases />
        </Suspense>
      </TabPane>
    );
    if (viewType === 'instance') {
      return [casesTab, detailsTab];
    }
    return [detailsTab, casesTab];
  }
  return (
    <div className={`${prefixCls}-instance`}>
      <PageTitle content={getTitle()} fallback={getFallBack()} />
      <Tabs
        className={`${prefixCls}-environment-tabs`}
        animated={false}
        activeKey={istStore.getTabKey}
        onChange={handleChange}
      >
        {chooseTab()}
        <TabPane
          key={PODS_TAB}
          tab={format({ id: 'PodDetails' })}
        >
          <Suspense fallback={<Spin />}>
            <PodsDetails />
          </Suspense>
        </TabPane>
      </Tabs>
      <Modals />
    </div>
  );
});

function computeUnlinkPod(all, run) {
  return all - run;
}

export default InstanceContent;
