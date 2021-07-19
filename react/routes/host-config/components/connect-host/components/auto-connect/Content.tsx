import React, {
  ReactNode,
  useCallback, useEffect, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Form,
  TextField,
  SelectBox,
  Password,
} from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { ButtonColor } from '@/interface';
import { NewTips } from '@choerodon/components';
import YamlEditor from '@/components/yamlEditor';
import TestResult from '@/routes/host-config/components/test-result';
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

  const [testResult, setTestResult] = useState<'' | 'success' | 'failed'>('');

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
          >
            上一步
          </Button>
          <Button
            color={'primary' as ButtonColor}
          >
            连接
          </Button>
        </>
      ),
    });
  }, []);

  const handleTest = useCallback(() => {
    setTestResult('success');
  }, []);

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
        {testResult && <TestResult status={testResult} className={`${prefixCls}-test-result`} />}
      </div>
    </div>
  );
});

export default AutoConnect;
