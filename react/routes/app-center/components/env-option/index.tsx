import React, { memo } from 'react';
import StatusDot from '@/components/status-dot';
import { Record } from '@/interface';

import './index.less';

interface props {
  record: Record,
  text: string,
}

const EnvOption: React.FC<props> = memo(({ record, text }) => {
  const prefixCls = 'c7ncd-app-center-env-option';
  return (
    <>
      {record && (
        <StatusDot
          // @ts-ignore
          connect={record?.get('connect')}
          synchronize={record?.get('synchro')}
          active={record?.get('active')}
          size="small"
        />
      )}
      <span className={`${prefixCls}-text`}>{text}</span>
    </>
  );
});

export default EnvOption;
