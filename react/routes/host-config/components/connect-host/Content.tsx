import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  message,
  Spin,
  TextArea,
  Button,
} from 'choerodon-ui/pro';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FuncType } from '@/interface';
import { useHostConnectStore } from './stores';

const HostConnect = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    formDs,
  } = useHostConnectStore();

  const record = useMemo(() => formDs.current, [formDs.current]);

  const handleCopy = useCallback(() => {
    message.info(formatMessage({ id: 'copy_success' }));
  }, []);

  if (!record) {
    return <Spin spinning />;
  }

  return (
    <div className={`${prefixCls}-form`}>
      <div className={`${prefixCls}-tips`}>
        {formatMessage({ id: `${intlPrefix}.connect.tips` })}
      </div>
      <Form dataSet={formDs}>
        <TextArea name="command" disabled />
      </Form>
      <CopyToClipboard text={record.get('command')}>
        <Button
          icon="content_copy"
          className={`${prefixCls}-copy`}
          onClick={handleCopy}
          funcType={'flat' as FuncType}
        />
      </CopyToClipboard>
    </div>
  );
});

export default HostConnect;
