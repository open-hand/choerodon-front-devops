/* eslint-disable react/require-default-props */

import React, { memo, useMemo } from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';

import './index.less';

interface Props {
  status: 'success' | 'failed',
  className?: string,
  failedMessage?: string,
}

const TestResult = memo(({ status, className = '', failedMessage = '' }: Props) => {
  const prefixCls = useMemo(() => 'c7ncd-test-result', []);
  return (
    <div className={`${prefixCls} ${prefixCls}-${status} ${className}`}>
      <span className={`${prefixCls}-label`}>测试连接：</span>
      {status === 'success' ? ([
        <Icon type="finished" />,
        <span>成功</span>,
      ]) : ([
        <Tooltip title={failedMessage}>
          <Icon type="highlight_off" />
        </Tooltip>,
        <span>失败</span>,
      ])}
    </div>
  );
});

export default TestResult;
