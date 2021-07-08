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
import { FuncType } from '@/interface';
import HostConnectServices from '@/routes/host-config/components/connect-host/services';
import { useHostConnectStore } from './stores';

const HostConnect = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    projectId,
    hostId,
    data,
  } = useHostConnectStore();

  const [command, setCommand] = useState(data || '');
  const permissionShell = useMemo(() => `
  sudo gpasswd -a "\${USER}" docker\n
  sudo systemctl restart docker\n
  newgrp - docker
  `, []);

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
    <div className={`${prefixCls}-form`}>
      <Alert
        className={`${prefixCls}-tips`}
        message={formatMessage({ id: `${intlPrefix}.connect.attention` })}
        type="error"
        showIcon
      />
      <div className={`${prefixCls}-label`}>
        <span>{formatMessage({ id: 'envPl.token' })}</span>
      </div>
      <div className={`${prefixCls}-content ${prefixCls}-content-mgb`}>
        <span>{'sudo gpasswd -a "${USER}" docker'}</span>
        <br />
        <span>sudo systemctl restart docker</span>
        <br />
        <span>newgrp - docker</span>
        <CopyToClipboard text={permissionShell} format>
          <Button
            icon="content_copy"
            className={`${prefixCls}-copy`}
            onClick={handleCopy}
            funcType={'flat' as FuncType}
          />
        </CopyToClipboard>
      </div>
      <Alert
        className={`${prefixCls}-tips`}
        message={formatMessage({ id: `${intlPrefix}.connect.tips` })}
        type="info"
        showIcon
      />
      <div className={`${prefixCls}-label`}>
        <span>{formatMessage({ id: `${intlPrefix}.connect.shell` })}</span>
      </div>
      <div className={`${prefixCls}-content`}>
        <span>{command}</span>
        <CopyToClipboard text={command}>
          <Button
            icon="content_copy"
            className={`${prefixCls}-copy`}
            onClick={handleCopy}
            funcType={'flat' as FuncType}
          />
        </CopyToClipboard>
      </div>
    </div>
  );
});

export default HostConnect;
