import React, { memo } from 'react';
import StatusDot from '@/components/status-dot';
import { Record } from '@/interface';

import './index.less';

interface props {
  record?: Record,
  connect?: boolean,
  text: string,
}

const EnvOption: React.FC<props> = memo(({ record, text, connect = false }) => {
  const prefixCls = 'c7ncd-app-center-env-option';
  return (
    <>
      <StatusDot
        // @ts-ignore
        connect={record?.get('connect') || connect}
        synchronize
        active
        size="small"
      />
      <span className={`${prefixCls}-text`}>{text}</span>
    </>
  );
});

export default EnvOption;
