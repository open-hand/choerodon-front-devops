import React, { memo, useMemo } from 'react';
import { Icon } from 'choerodon-ui/pro';

import './index.less';

interface Props {
  status: 'success' | 'failed',
  // eslint-disable-next-line react/require-default-props
  className?: string,
}

const TestResult = memo(({ status, className = '' }: Props) => {
  const prefixCls = useMemo(() => 'c7ncd-test-result', []);
  return (
    <div className={`${prefixCls} ${prefixCls}-${status} ${className}`}>
      <span className={`${prefixCls}-label`}>测试连接：</span>
      {status === 'success' ? ([
        <Icon type="finished" />,
        <span>成功</span>,
      ]) : ([
        <Icon type="highlight_off" />,
        <span>失败</span>,
      ])}
    </div>
  );
});

export default TestResult;
