import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Password, SelectBox, Spin, TextField,
} from 'choerodon-ui/pro';
import { Alert, Tabs, Divider } from 'choerodon-ui';
import pick from 'lodash/pick';
import Tips from '@/components/new-tips';
import HostConfigApis from '@/routes/host-config/apis';
import YamlEditor from '@/components/yamlEditor';
import { useCreateHostStore } from './stores';
import JmeterGuide from './components/jmeter-guide';
import TestConnect from './components/test-connect';

const { TabPane } = Tabs;

const CreateHost: React.FC<any> = observer((): any => {
  const {
    prefixCls,
    formDs,
    intlPrefix,
    modal,
    formatMessage,
    projectId,
    refresh,
    hostId,
    showTestTab,
  } = useCreateHostStore();

  modal.handleOk(async () => {
    try {
      const record = formDs.current;
      if (record && !(record.get('hostIp') || record.get('sshPort') || record.get('privateIp') || record.get('privatePort'))) {
        return false;
      }
      const res = await formDs.submit();
      if (res) {
        refresh();
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
      const res = await HostConfigApis.testConnection(projectId, postData, postData.type);
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
        {showTestTab && <SelectBox name="type" disabled={!!hostId} />}
        <TextField name="name" style={{ marginTop: '-10px' }} />
      </Form>
      {formDs && formDs.current && formDs.current.get('type') === 'deploy' ? ([
        <Divider className={`${prefixCls}-divider`} />,
        <Alert
          type="info"
          showIcon
          message="外部SSH认证与内部SSH认证至少填写一个模块"
          className={`${prefixCls}-alert`}
        />,
        <Tabs defaultActiveKey="external">
          <TabPane tab="外部SSH认证" key="external">
            <Form dataSet={formDs} className={`${prefixCls}-form`}>
              <TextField name="hostIp" />
              <TextField name="sshPort" />
            </Form>
          </TabPane>
          <TabPane tab="内部SSH认证" key="internal">
            <Form dataSet={formDs} className={`${prefixCls}-form`}>
              <TextField name="privateIp" />
              <TextField name="privatePort" />
            </Form>
          </TabPane>
        </Tabs>,
      ]) : (
        <Form dataSet={formDs} className={`${prefixCls}-form`}>
          <TextField name="hostIp" />
          <TextField name="sshPort" />
        </Form>
      )}
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
      {formDs && formDs.current && formDs.current.get('type') === 'distribute_test' && ([
        <div>
          <Divider className={`${prefixCls}-divider`} />
          <span>{formatMessage({ id: `${intlPrefix}.jmeter` })}</span>
        </div>,
        <Form dataSet={formDs} className={`${prefixCls}-form`}>
          <TextField name="jmeterPort" />
          <TextField name="jmeterPath" />
        </Form>,
      ])}
      {formDs && formDs.current && formDs.current.get('type') === 'distribute_test' && (
        <JmeterGuide />
      )}
      <TestConnect handleTestConnection={handleTestConnection} />
    </div>
  );
});

export default CreateHost;
