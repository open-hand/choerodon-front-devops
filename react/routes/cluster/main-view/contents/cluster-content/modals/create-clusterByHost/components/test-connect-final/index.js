/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Tooltip } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import { useFormStore } from '../../stores';

import './index.less';

const { Step } = Steps;
const STATUS = {
  success: 'finish',
  failed: 'error',
  operating: 'process',
  wait: 'wait',
};

const TestConnect = observer(({ connectRecord }) => {
  const {
    prefixCls,
  } = useFormStore();

  const subfixCls = `${prefixCls}-final-connect`;

  const getContent = () => {
    if (connectRecord) {
      const {
        configuration, system, memory, cpu,
      } = connectRecord;

      return (
        <Steps progressDot size="small">
          <Step
            status={STATUS[configuration.status]}
            title={configuration.status === 'failed' && configuration.errorMessage ? (
              <span>
                配置校验
                <Tooltip title={configuration.errorMessage}>
                  <Icon type="info" className={`${subfixCls}-test-failed-icon`} />
                </Tooltip>
              </span>
            ) : '配置校验'}
          />
          <Step
            // @ts-ignore
            status={STATUS[system.status]}
            title={system.status === 'failed' && system.errorMessage ? (
              <span>
                节点系统校验
                <Tooltip title={system.errorMessage}>
                  <Icon type="info" className={`${subfixCls}-test-failed-icon`} />
                </Tooltip>
              </span>
            ) : '节点系统校验'}
          />
          <Step
            // @ts-ignore
            status={STATUS[memory.status]}
            title={memory.status === 'failed' && memory.errorMessage ? (
              <span>
                节点内存校验
                <Tooltip title={memory.errorMessage}>
                  <Icon type="info" className={`${subfixCls}-test-failed-icon`} />
                </Tooltip>
              </span>
            ) : '节点内存校验'}
          />
          <Step
            // @ts-ignore
            status={STATUS[cpu.status]}
            title={cpu.status === 'failed' && cpu.errorMessage ? (
              <span>
                节点CPU校验
                <Tooltip title={cpu.errorMessage}>
                  <Icon type="info" className={`${subfixCls}-test-failed-icon`} />
                </Tooltip>
              </span>
            ) : '节点CPU校验'}
          />
        </Steps>
      );
    }
    return null;
  };

  return (
    <div id="loadingProgress" className={`${subfixCls}-test ${subfixCls}-test${connectRecord && connectRecord.status ? `-${connectRecord.status}` : ''}`}>
      {
        connectRecord?.errorMsg && (
        <Tooltip title={connectRecord?.errorMsg}>
          <Icon type="info" className={`${subfixCls}-test-finalMes`} />
        </Tooltip>
        )
      }
      {getContent()}
    </div>
  );
});

export default TestConnect;
