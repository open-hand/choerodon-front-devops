import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  message,
  Button,
  Form,
  Radio,
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

  const [docker, setDocker] = useState(true);
  const [command, setCommand] = useState(data || '');

  const newPrefixCls = useMemo(() => `${prefixCls}-manual`, []);
  const permissionShell = useMemo(() => `
  sudo gpasswd -a "\${USER}" docker\n
  sudo systemctl restart docker\n
  newgrp - docker
  `, []);

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
      <span className={`${newPrefixCls}-label`}>
        主机是否支持Docker镜像部署
      </span>
      <Form columns={2}>
        <Radio name="docker" checked={docker} value onChange={setDocker}>是</Radio>
        <Radio name="docker" checked={!docker} value={false} onChange={setDocker}>否</Radio>
      </Form>
      {docker && (
        <>
          <Alert
            className={`${newPrefixCls}-tips`}
            message={formatMessage({ id: `${intlPrefix}.connect.attention` })}
            type="error"
            showIcon
          />
          <div className={`${newPrefixCls}-title`}>
            <span>{formatMessage({ id: 'envPl.token' })}</span>
          </div>
          <div className={`${newPrefixCls}-content ${newPrefixCls}-content-mgb`}>
            <span>{'sudo gpasswd -a "${USER}" docker'}</span>
            <br />
            <span>sudo systemctl restart docker</span>
            <br />
            <span>newgrp - docker</span>
            <CopyToClipboard text={permissionShell} format>
              <Button
                icon="content_copy"
                className={`${newPrefixCls}-copy`}
                onClick={handleCopy}
                funcType={'flat' as FuncType}
              />
            </CopyToClipboard>
          </div>
        </>
      )}
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
