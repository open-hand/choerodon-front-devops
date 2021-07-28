import React, {
  ReactNode,
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Form,
  TextField,
  SelectBox,
  Password,
  Spin,
} from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { ButtonColor } from '@/interface';
import { NewTips } from '@choerodon/components';
import YamlEditor from '@/components/yamlEditor';
import TestResult from '@/routes/host-config/components/test-result';
import HostConnectServices from '@/routes/host-config/components/connect-host/services';
import { useAutoConnectStore } from './stores';
import { useHostConnectStore } from '../../stores';

import './index.less';

const AutoConnect = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    projectId,
    hostId,
    modal,
    mainStore,
    stepKeys: { ALL },
  } = useHostConnectStore();

  const {
    prefixCls,
    formDs,
  } = useAutoConnectStore();

  const record = useMemo(() => formDs.current, [formDs.current]);

  const [testResult, setTestResult] = useState<'' | 'success' | 'failed'>('');
  const [failedMessage, setFailedMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [intervalTimer, setIntervalTimer] = useState<any>();

  const goPrevious = useCallback(() => {
    mainStore.setCurrentStep(ALL);
  }, []);

  useEffect(() => {
    modal.update({
      title: '自动连接',
      footer: (okBtn: ReactNode, cancelBtn: ReactNode) => (
        <>
          {cancelBtn}
          <Button
            onClick={goPrevious}
            disabled={isLoading}
          >
            上一步
          </Button>
          <Button
            color={'primary' as ButtonColor}
            loading={isLoading}
            onClick={handleConnect}
          >
            连接
          </Button>
        </>
      ),
    });
  }, [isLoading]);

  useEffect(() => () => {
    intervalTimer && clearInterval(intervalTimer);
  }, [intervalTimer]);

  const loadConnectStatus = useCallback(async () => {
    const res = await HostConnectServices.getHostConnectStatus(projectId, hostId);
    if (res?.status !== 'operating') {
      setIsLoading(false);
      intervalTimer && clearInterval(intervalTimer);
      setIntervalTimer(null);
      setTestResult(res?.status);
      if (res?.status === 'success') {
        modal.close();
      } else {
        setFailedMessage(res?.exception || '');
      }
    }
  }, [projectId, hostId]);

  const handleConnect = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!await handleTest()) {
        setIsLoading(false);
        return false;
      }
      await formDs.submit();
      setIntervalTimer(setInterval(() => {
        loadConnectStatus();
      }, 2000));
      return false;
    } catch (e) {
      setIsLoading(false);
      return false;
    }
  }, []);

  const handleTest = useCallback(async () => {
    const validate = await formDs.validate();
    if (!validate) {
      return false;
    }
    const postData = formDs.current?.toData();
    const res = await HostConnectServices.testConnect(projectId, hostId, postData);
    setTestResult(res?.status);
    setFailedMessage(res?.exception);
    return res?.status === 'success';
  }, [projectId, hostId]);

  if (!record) {
    return <Spin />;
  }

  return (
    <div className={`${prefixCls}`}>
      <NewTips
        className={`${prefixCls}-module-title`}
        title={formatMessage({ id: `${intlPrefix}.attest.external` })}
        helpText={formatMessage({ id: `${intlPrefix}.attest.tips` })}
      />
      <Form dataSet={formDs} className={`${prefixCls}-form-mt`}>
        <TextField name="hostIp" />
        <TextField name="sshPort" />
      </Form>
      <Divider className={`${prefixCls}-divider`} />
      <NewTips
        className={`${prefixCls}-module-title`}
        title={formatMessage({ id: `${intlPrefix}.account.external` })}
        helpText={formatMessage({ id: `${intlPrefix}.account.tips` })}
      />
      <Form dataSet={formDs} className={`${prefixCls}-form`}>
        <SelectBox name="authType" />
        <TextField name="username" style={{ marginTop: '-10px' }} />
        {formDs && formDs.current && formDs.current.get('authType') === 'publickey' ? ([
          <span className={`${prefixCls}-form-password`}>密钥</span>,
          <YamlEditor
            readOnly={false}
            newLine
            value={formDs.current.get('password')}
            onValueChange={(valueYaml: any) => formDs.current?.set('password', valueYaml)}
            modeChange={false}
            showError={false}
          />,
          formDs.current?.getField('password')?.getValidationMessage() ? (
            <span className={`${prefixCls}-form-password-error`}>
              {formDs.current?.getField('password')?.getValidationMessage()}
            </span>
          ) : null,
        ]) : <Password name="password" reveal={false} />}
      </Form>
      <div className={`${prefixCls}-test`}>
        <Button onClick={handleTest}>
          测试连接
        </Button>
        {testResult && (
          <TestResult
            status={testResult}
            className={`${prefixCls}-test-result`}
            failedMessage={failedMessage}
          />
        )}
      </div>
    </div>
  );
});

export default AutoConnect;
