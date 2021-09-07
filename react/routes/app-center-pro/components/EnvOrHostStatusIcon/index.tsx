import React from 'react';
import { ENV_TAB, HOST_TAB } from '../../stores/CONST';
import PodCircle from '@/components/pod-circle';

type EnvOrHostProps = {
  currentType: typeof HOST_TAB | typeof ENV_TAB
  podRunningCount: number
  podCount: number
}

const EnvOrHostStatusIcon = (props:EnvOrHostProps) => {
  const {
    currentType,
    podRunningCount,
    podCount,
  } = props;

  if (currentType !== HOST_TAB) {
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
  }

  return <></>;
};

export default EnvOrHostStatusIcon;
