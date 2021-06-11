/* eslint-disable react/require-default-props */

import React, { useCallback, useMemo, useState } from 'react';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { useDebounce } from 'ahooks';
import { FuncType } from '@/interface';
import { StoreProps } from '@/routes/resource/main-view/contents/workload/stores/useStore';

import './index.less';

interface PodProps {
  size?: number,
  strokeWidth?: number,
  podCount: number,
  podRunningCount: number,
  showBtn?: boolean,
  btnDisabled?: boolean,
  store?: StoreProps
  projectId?: number,
  envId?: string,
  refresh?(): void,
}

const PodContent = ({
  size = 40, podCount = 0, podRunningCount = 0, strokeWidth = 2,
  showBtn = false, btnDisabled = false, store, projectId, envId, refresh,
}: PodProps) => {
  const prefixCls = useMemo(() => 'c7ncd-deployment-workload-pod', []);
  const cx = useMemo(() => size / 2, [size]);
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const correct = useMemo(() => (
    (podRunningCount / podCount) * Math.PI * radius * 2
  ), [radius, podCount, podRunningCount]);

  const [realPodCount, setRealPodCount] = useState(podCount);

  const handleIncrease = useCallback(() => {
    const count = realPodCount + 1;
    setRealPodCount(count);
    operatePodCount(count);
  }, [realPodCount]);

  const handleDecrease = useCallback(() => {

  }, []);

  const operatePodCount = useDebounce(async (count: number) => {
    // if (!projectId || !envId) {
    //   return;
    // }
    // try {
    //   const res = await store?.operatePodCount({
    //     projectId, envId, name: 'Deployment', count,
    //   });
    //   if (res && res.failed) {
    //     setRealPodCount(podCount);
    //   } else {
    //     refresh && refresh();
    //   }
    // } catch (e) {
    //   setRealPodCount(podCount);
    // }
  }, { wait: 600 });

  return (
    <div className={prefixCls}>
      <svg width={size} height={size} className={`${prefixCls}-circle-wrap`}>
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          strokeWidth={podCount === 0 || podCount > podRunningCount ? strokeWidth : 0}
          stroke={podCount > 0 ? '#ffb100' : '#f3f3f3'}
          className={`${prefixCls}-error`}
        />
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          className={`${prefixCls}-circle`}
          stroke="#0bc2a8"
          strokeWidth={strokeWidth}
          fill="none"
          transform={`matrix(0,-1,1,0,0,${size})`}
          strokeDasharray={`${correct}, 10000`}
        />
        <text x="50%" y="50%" className={`${prefixCls}-num`}>
          {podCount}
        </text>
        <text x="50%" y="80%" className={`${prefixCls}-text`}>
          {podCount > 1 ? 'pods' : 'pod'}
        </text>
      </svg>
      {showBtn && (
        <div className={`${prefixCls}-btn-wrap`}>
          <Button
            disabled={btnDisabled}
            className={`${prefixCls}-btn-wrap-item`}
            icon="expand_less"
            onClick={handleIncrease}
            funcType={'flat' as FuncType}
          />
          <Button
            disabled={btnDisabled || realPodCount <= 1}
            className={`${prefixCls}-btn-wrap-item`}
            icon="expand_more"
            onClick={handleDecrease}
            funcType={'flat' as FuncType}
          />
        </div>
      )}
    </div>
  );
};

export default PodContent;
