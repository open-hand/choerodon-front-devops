import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  message,
  Button,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FuncType, ButtonColor } from '@/interface';
import HostConnectServices from '@/routes/host-config/components/connect-host/services';
import { useHostConnectStore } from '../../stores';

import './index.less';

const ManualConnect = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    projectId,
    hostId,
    data,
    modal,
    mainStore,
    stepKeys: { ALL },
  } = useHostConnectStore();

  const [command, setCommand] = useState(data || '');

  const newPrefixCls = useMemo(() => `${prefixCls}-manual`, []);

  const goPrevious = useCallback(() => {
    mainStore.setCurrentStep(ALL);
  }, []);

  useEffect(() => {
    modal.update({
      title: '手动连接',
      footer: () => (
        <>
          <Button
            onClick={goPrevious}
          >
            上一步
          </Button>
          <Button
            color={'primary' as ButtonColor}
            onClick={() => modal.close()}
          >
            关闭
          </Button>
        </>
      ),
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      const res = await HostConnectServices.getLinkShell(projectId, hostId);
      setCommand(res);
    } catch (e) {
      // setCommand('');
    }
  }, []);

  useEffect(() => {
    if (!data && hostId) {
      loadData();
    }
  }, []);

  const handleCopy = useCallback(() => {
    message.info(formatMessage({ id: 'copy_success' }));
  }, []);

  return (
    <div className={`${newPrefixCls}`}>
      <Alert
        className={`${newPrefixCls}-tips`}
        message={formatMessage({ id: `${intlPrefix}.connect.tips` })}
        type="info"
        showIcon
      />
      <div className={`${newPrefixCls}-title`}>
        <span>{formatMessage({ id: `${intlPrefix}.connect.shell` })}</span>
      </div>
      <div className={`${newPrefixCls}-content`}>
        <span>{command}</span>
        <CopyToClipboard text={command}>
          <Button
            icon="content_copy"
            className={`${newPrefixCls}-copy`}
            onClick={handleCopy}
            funcType={'flat' as FuncType}
          />
        </CopyToClipboard>
      </div>
    </div>
  );
});

export default ManualConnect;
