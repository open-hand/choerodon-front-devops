import React from 'react';
import {
  StatusTag,
} from '@choerodon/components';
import { StatusKind } from '@choerodon/components/lib/status-tag';
import { ENV_TAB, HOST_TAB } from '../../stores/CONST';
import PodCircle from '@/components/pod-circle';

type EnvOrHostProps = {
  currentType: typeof HOST_TAB | typeof ENV_TAB
  hostStatus: StatusKind
  hostError: string
  podRunningCount: number
  podCount: number
}

const EnvOrHostStatusIcon = (props:EnvOrHostProps) => {
  const {
    currentType,
    hostStatus,
    hostError,
    podRunningCount,
    podCount,
  } = props;

  if (currentType === HOST_TAB) {
    const operateStatus = hostStatus;
    const error = hostError;
    return (operateStatus && !(operateStatus === 'success') ? (
      <StatusTag
        style={{
          marginLeft: '5px',
        }}
        ellipsisTitle={error}
        colorCode={operateStatus}
        name={operateStatus === 'operating' ? '执行中' : '失败'}
      />
    ) : <span />);
  }

  return (
    <PodCircle
      // @ts-expect-error
      style={{
        width: 20,
        height: 20,
      }}
      dataSource={[{
        name: 'running',
        value: podRunningCount,
        stroke: '#0bc2a8',
      }, {
        name: 'unlink',
        value: podCount - podRunningCount,
        stroke: '#fbb100',
      }]}
    />
  );
};

export default EnvOrHostStatusIcon;
