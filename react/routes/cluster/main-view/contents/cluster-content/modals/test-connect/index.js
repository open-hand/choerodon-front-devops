/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Tooltip } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';

import './index.less';

const prefixCls = 'c7ncd-cluster';

const TestConnect = observer(({ handleTestConnection, nodeRecord }) => {
  const getContent = () => {
    if (nodeRecord) {
      const status = nodeRecord.get('status') || 'wait';
      let content;
      switch (status) {
        case 'success':
          content = [
            <Icon
              type="finished"
              className={`${prefixCls}-test-text-icon`}
            />,
            <span>成功</span>,
          ];
          break;
        case 'failed':
          content = [
            <Icon
              type="highlight_off"
              className={`${prefixCls}-test-text-icon`}
            />, <span>失败</span>,
          ];
          break;
        case 'operating':
          content = '正在进行连接测试';
          break;
        default:
          content = '未进行连接测试';
      }
      return (
        <span className={`${prefixCls}-test-text ${prefixCls}-test-text${status ? `-${status}` : ''}`}>
          {content}
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`${prefixCls}-test ${prefixCls}-test${nodeRecord && nodeRecord.get('status') ? `-${nodeRecord.get('status')}` : ''}`}>
      <Button
        onClick={handleTestConnection}
        className={`${prefixCls}-test-btn`}
        disabled={nodeRecord && nodeRecord.get('status') === 'operating'}
      >
        测试连接
      </Button>
      {getContent()}
    </div>
  );
});

export default TestConnect;
