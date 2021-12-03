/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
/* eslint-disable */
import React, { Fragment, Suspense, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui';
import { useClusterMainStore } from '../../../stores';
import { useClusterContentStore } from '../stores';
import EmptyPage from '../../../../../../components/empty-page';

import './index.less';

export default observer((props) => {
  const {
    intlPrefix,
    prefixCls,
  } = useClusterMainStore();
  const {
    contentStore: {
      getGrafanaUrl,
      setTabKey,
    },
    formatMessage,
    tabs: {
      COMPONENT_TAB,
    },
    ClusterDetailDs,
  } = useClusterContentStore();

  function refresh() {

  }

  function LinkToComponent() {
    setTabKey(COMPONENT_TAB);
  }

  function getContent() {
    if (getGrafanaUrl) {
      const code = ClusterDetailDs.current ? ClusterDetailDs.current.get('code') : '';
      return (
        <iframe
          height={700}
          width="100%"
          src={`${getGrafanaUrl}?kiosk=tv`}
          title="grafana"
          frameBorder={0}
          sandbox
        />
      );
    }
    return (
      <EmptyPage
        title={formatMessage({ id: 'c7ncd-clusterManagement.InstallingMonitoringComponents' })}
        describe={formatMessage({ id: 'c7ncd-clusterManagement.Nomonitoring' })}
        btnText={formatMessage({ id: 'c7ncd-clusterManagement.SkiptoComponentManagement' })}
        onClick={LinkToComponent}
        access
      />
    );
  }

  return (
    <div className={`${prefixCls}-monitor-wrap`}>
      <Suspense fallback={<Spin />}>
        {getContent()}
      </Suspense>
    </div>
  );
});
