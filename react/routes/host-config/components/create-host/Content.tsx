import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Password, SelectBox, Spin, TextField,
} from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import pick from 'lodash/pick';
import HostConfigApis from '@/routes/host-config/apis/TestApis';
import YamlEditor from '@/components/yamlEditor';
import { useCreateHostStore } from './stores';
import JmeterGuide from './components/jmeter-guide';
import TestConnect from './components/test-connect';

const CreateHost: React.FC<any> = observer((): any => {
  const {
    prefixCls,
    formDs,
    intlPrefix,
    modal,
    formatMessage,
    projectId,
    refresh,
  } = useCreateHostStore();

  modal.handleOk(async () => {
    try {
      const record = formDs.current;
      const selectedTabKey = record?.get('type');
      const res = await formDs.submit();
      if (res) {
        refresh(selectedTabKey);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const handleTestConnection = async () => {
    try {
      const validate = await formDs.validate();
      const record = formDs.current;
      // @ts-ignore
      // 单独再次校验密码是因为：修改时无任何操作，formDs.validate() 返回为true
      if (!validate || !record || await record.getField('password').checkValidity() === false) {
        return false;
      }
      const postData = pick(record.toData(), ['type', 'authType', 'hostIp', 'sshPort', 'username', 'password', 'jmeterPort', 'jmeterPath']);
      modal.update({
        okProps: { disabled: true },
      });
      record.set('status', 'operating');
      if (postData.type === 'deploy') {
        postData.jmeterPort = null;
      } else {
        record.set('jmeterStatus', 'operating');
      }
      record.set('hostStatus', 'operating');
      const res = await HostConfigApis.testConnection(projectId, postData);
      modal.update({
        okProps: { disabled: false },
      });
      if (res) {
        const {
          hostStatus, jmeterStatus, hostCheckError, jmeterCheckError,
        } = res;
        // eslint-disable-next-line no-nested-ternary
        const status = [hostStatus, jmeterStatus].includes('failed') ? 'failed' : hostStatus === 'success' && jmeterStatus === 'success' ? 'success' : 'operating';
        record.set('hostStatus', hostStatus);
        record.set('jmeterStatus', jmeterStatus);
        record.set('hostCheckError', hostCheckError);
        record.set('jmeterCheckError', jmeterCheckError);
        record.set('status', postData.type === 'deploy' ? hostStatus : status);
      }
      return true;
    } catch (e) {
      const record = formDs.current;
      if (record) {
        record.set('hostStatus', 'wait');
        record.set('jmeterStatus', 'wait');
        record.set('status', 'wait');
      }
      modal.update({
        okProps: { disabled: false },
      });
      return false;
    }
  };

  if (formDs && formDs.status === 'loading') {
    return <Spin spinning />;
  }

  return (
    <div className={`${prefixCls}`}>
      <Form dataSet={formDs} className={`${prefixCls}-form`}>
        <TextField name="name" />
        <TextField name="hostIp" />
        <TextField name="sshPort" />
      </Form>
      <Divider className={`${prefixCls}-divider`} />
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
      <div>
        <Divider className={`${prefixCls}-divider`} />
        <span>{formatMessage({ id: `${intlPrefix}.jmeter` })}</span>
      </div>
      <Form dataSet={formDs} className={`${prefixCls}-form`}>
        <TextField name="jmeterPort" />
        <TextField name="jmeterPath" />
      </Form>
      <JmeterGuide />
      <TestConnect handleTestConnection={handleTestConnection} />
    </div>
  );
});

export default CreateHost;
