import React, {
  Fragment, Suspense, useMemo, useState, useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Spin, Button, Icon } from 'choerodon-ui';
import { useClusterMainStore } from '../../../../stores';
import { useClusterContentStore } from '../../stores';
import Radar from '../../../../../../../components/Radar';
import './index.less';

const checkGroup = [
  {
    checkType: 'successes',
    icon: 'check',
    text: 'checks passed',
  },
  {
    checkType: 'warnings',
    icon: 'priority_high',
    text: 'checks had warning',
  },
  {
    checkType: 'errors',
    icon: 'close',
    text: 'checks had errors',
  },
];

const categoryGroup = [
  {
    category_type: 'kubernetesVersion',
    name: 'c7ncd-clusterManagement.KubernetesVersion',
    icon: 'saga_define',
  },
  {
    category_type: 'pods',
    name: 'c7ncd-clusterManagement.NumberofPods',
    icon: 'toll',
  },
  {
    category_type: 'nodes',
    name: 'c7ncd-clusterManagement.NumberofNodes',
    icon: 'instance_outline',
  },
  {
    category_type: 'namespaces',
    name: 'c7ncd-clusterManagement.NumberofEnvironment',
    icon: 'grain',
  },
];

const numberDetail = observer(({ isLoading }) => {
  const {
    intlPrefix,
    prefixCls,
  } = useClusterMainStore();

  const {
    formatMessage,
    polarisNumDS,
  } = useClusterContentStore();

  useEffect(() => {

  }, []);

  function refresh() {

  }

  function renderNumPanel() {
    return checkGroup.map((item, key) => (
      <div className={`${prefixCls}-number-check`} key={item.checkType}>
        <Icon type={item.icon} />
        <span>
          {!isLoading ? (polarisNumDS.current && (polarisNumDS.current.get(item.checkType) || 0)) : '-'}
&nbsp;
          {item.text}
        </span>
      </div>
    ));
  }

  function renderDetailPanel(inFormatMessage) {
    return categoryGroup.map((item) => (
      <div className={`${prefixCls}-number-category`} key={item.category_type}>
        <Icon type={item.icon} />
        <div className={`${prefixCls}-number-category-detail`}>
          <span>{inFormatMessage({ id: item.name })}</span>
          <span>{polarisNumDS.current ? (polarisNumDS.current.get(item.category_type) || '-') : '-'}</span>
        </div>
      </div>
    ));
  }

  function renderRadar() {
    const score = polarisNumDS.current && polarisNumDS.current.get('score');
    return (
      <Radar
        num={!isLoading ? score : null}
        loading={isLoading}
        failed={polarisNumDS.current && (polarisNumDS.current.get('status') === 'failed' || polarisNumDS.current.get('status') === 'timeout')}
      />
    );
  }

  return (
    <div className={`${prefixCls}-number`}>
      <div className={`${prefixCls}-number-left`}>
        <div className={`${prefixCls}-number-leftTop`}>
          {/* 最新一次扫描时间 */}
          <span className={`${prefixCls}-number-leftTop-lastestDate`}>
            {formatMessage({ id: 'c7ncd-clusterManagement.EndTimeofLastScan' })}
            {polarisNumDS.current ? polarisNumDS.current.get('lastScanDateTime') : '-'}
          </span>

        </div>
        <div className={`${prefixCls}-number-leftDown`}>
          <div className={`${prefixCls}-number-leftDown-left`}>
            {renderNumPanel()}
          </div>
          {renderRadar()}
        </div>
      </div>
      <div className={`${prefixCls}-number-right`}>
        <div className={`${prefixCls}-number-right-list`}>
          {renderDetailPanel(formatMessage)}
        </div>
      </div>
    </div>
  );
});

export default numberDetail;
