import React from 'react';
import { observer } from 'mobx-react-lite';
import { Icon } from 'choerodon-ui';
import Radar from '@/components/Radar';
import { useREStore } from '../../../../../stores';
import { useResourceStore } from '../../../../../../../../stores';

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
    checkType: 'kubernetesVersion',
    name: 'Kubernetes版本',
    icon: 'saga_define',
  },
  {
    checkType: 'instanceCount',
    name: '实例数量',
    icon: 'instance_outline',
  },
  {
    checkType: 'pods',
    name: 'Pods数量',
    icon: 'toll',
  },
];

const numberDetail = observer(({ isLoading }:{
  isLoading: boolean
}) => {
  const {
    prefixCls,
    formatMessage,
  } = useResourceStore();

  const {
    polarisNumDS,
  } = useREStore();

  function renderNumPanel() {
    return checkGroup.map((item) => (
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

  function renderDetailPanel() {
    return categoryGroup.map((item, key) => (
      <div className={`${prefixCls}-number-category`} key={item?.checkType}>
        <Icon type={item.icon} />
        <div className={`${prefixCls}-number-category-detail`}>
          <span>{item.name}</span>
          <span>{polarisNumDS.current ? (polarisNumDS.current.get(item.checkType) || '-') : '-'}</span>
        </div>
      </div>
    ));
  }

  function renderRadar() {
    const score = polarisNumDS.current && polarisNumDS.current.get('score');
    return (
      <Radar
      // @ts-expect-error
        num={!isLoading ? score : null}
        loading={isLoading}
        failed={polarisNumDS.current && polarisNumDS.current.get('status') === 'failed'}
      />
    );
  }

  return (
    <div className={`${prefixCls}-number`}>
      <div className={`${prefixCls}-number-left`}>
        <div className={`${prefixCls}-number-leftTop`}>
          <span className={`${prefixCls}-number-leftTop-lastestDate`}>
            {formatMessage({ id: 'c7ncd.cluster.polaris.lastedScanDate' })}
            {polarisNumDS.current ? polarisNumDS.current.get('lastScanDateTime') : '-'}
          </span>

        </div>
        <div className={`${prefixCls}-number-leftDown`}>
          <div className={`${prefixCls}-number-leftDown-left`}>
            {renderNumPanel()}
          </div>
          {/* 扫描动画 */}
          {renderRadar()}
        </div>
      </div>
      <div className={`${prefixCls}-number-right`}>
        <div className={`${prefixCls}-number-right-list`}>
          {renderDetailPanel()}
        </div>
      </div>
    </div>
  );
});

export default numberDetail;
