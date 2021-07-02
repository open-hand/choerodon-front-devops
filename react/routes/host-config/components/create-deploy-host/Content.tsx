import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Password, SelectBox, Spin, TextField, Modal,
} from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import isEmpty from 'lodash/isEmpty';
import YamlEditor from '@/components/yamlEditor';
import { NewTips } from '@choerodon/components';
import HostConnect from '@/routes/host-config/components/connect-host';
import { SMALL } from '@/utils/getModalWidth';
import { useCreateHostStore } from './stores';

const commandModalKey = Modal.key();

const CreateHost: React.FC<any> = observer((): any => {
  const {
    prefixCls,
    intlPrefix,
    formDs,
    modal,
    formatMessage,
    refresh,
    hostId,
  } = useCreateHostStore();

  modal.handleOk(async () => {
    try {
      const res = await formDs.submit();
      if (res) {
        refresh('deploy');
        if (!hostId && !isEmpty(res?.list) && res.list[0]?.data) {
          Modal.open({
            key: commandModalKey,
            title: formatMessage({ id: `${intlPrefix}.connect` }),
            children: <HostConnect data={res.list[0]?.data} />,
            style: { width: SMALL },
            drawer: true,
            okCancel: false,
            okText: formatMessage({ id: 'close' }),
          });
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

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
      <NewTips
        className={`${prefixCls}-module-title`}
        title={formatMessage({ id: `${intlPrefix}.account` })}
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
    </div>
  );
});

export default CreateHost;
