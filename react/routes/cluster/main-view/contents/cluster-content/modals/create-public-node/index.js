/* eslint-disable max-len */
import React, {
  useEffect, useMemo, useState, useCallback,
} from 'react';
import {
  Form, TextField, SelectBox, Password, Button, TextArea,
} from 'choerodon-ui/pro/lib';
import { observer } from 'mobx-react-lite';
import Tips from '@/components/new-tips';
import { difference, pick, without } from 'lodash';
import { Base64 } from 'js-base64';
import YamlEditor from '@/components/yamlEditor';

import TestConnect from '../test-connect';

import './index.less';

const PublicNode = observer((props) => {
  const {
    prefixCls,
    publicNodeDs,
    parentModal,
    createHostClusterMainStore,
    projectId,
  } = props;

  const connectFields = useMemo(() => ['hostIp', 'hostPort', 'authType', 'username', 'password'], []);

  const [expand, changeExpand] = useState(false);

  useEffect(() => {

  }, []);

  async function checkConnectValidate() {
    const hasIp = publicNodeDs.current && await publicNodeDs.current.getField('hostIp').checkValidity();
    const hasPort = publicNodeDs.current && await publicNodeDs.current.getField('hostPort').checkValidity();
    const hasAccountType = publicNodeDs.current && await publicNodeDs.current.getField('authType').checkValidity();
    const hasUsername = publicNodeDs.current && await publicNodeDs.current.getField('username').checkValidity();
    const hasPassword = publicNodeDs.current && await publicNodeDs.current.getField('password').checkValidity();
    return hasIp && hasPort && hasAccountType && hasUsername && hasPassword;
  }

  function setConnectFieldDisabeld() {
    connectFields.forEach((item) => {
      publicNodeDs.current.getField(item).set('disabled', true);
    });
  }

  function setConnectFieldEnabled() {
    connectFields.forEach((item) => {
      publicNodeDs.current.getField(item).set('disabled', false);
    });
  }

  function setParentModalEnabled(value) {
    if (typeof value === 'boolean') {
      parentModal && parentModal.update({
        okProps: {
          loading: value,
        },
        cancelProps: {
          disabled: value,
        },
      });
    }
  }

  async function handleTestConnection() {
    const validate = await checkConnectValidate();
    if (!validate || !publicNodeDs) {
      return false;
    }
    publicNodeDs.current.set('status', 'operating');
    // 再进行节点的连接测试的时候需要去把父组件传过来的modal给禁用不让他关闭
    setParentModalEnabled(true);
    // 然后禁用那些框
    setConnectFieldDisabeld();

    const data = pick(publicNodeDs.toData()[0], ['hostPort', 'password', 'hostIp', 'username', 'authType']);

    if (data.authType === 'publickey') {
      data.password = Base64.encode(data.password);
    }

    try {
      const res = await createHostClusterMainStore.checkNodeConnect(projectId, data);
      setParentModalEnabled(false);
      if (res && res.failed) {
        return false;
      }
      publicNodeDs.current.set('status', res ? 'success' : 'failed');
    } catch (error) {
      publicNodeDs.current.set('status', 'linkError');
      setConnectFieldEnabled();

      setParentModalEnabled(false);
    }
    // 若请求失败了，则把框警用取消
    setConnectFieldEnabled();

    setParentModalEnabled(false);
    return true;
  }

  const renderLinkStatusMes = useCallback(() => {
    const status = publicNodeDs.current && publicNodeDs.current.get('status');
    let mes;
    switch (status) {
      case 'wait':
        mes = '请进行连接检测。';
        break;
      case 'linkError':
        mes = '连接异常，请重新进行连接检测。';
        break;
      default:
        break;
    }
    return <span>{mes}</span>;
  }, [publicNodeDs.current]);

  function checkHasAllConnectFieldsFilled() {
    const tempObj = publicNodeDs.toData()[0];
    const tempArr = ['hostIp', 'hostPort', 'username', 'password', 'authType'];
    const differArr = without(tempArr, ...Object.keys(tempObj));
    if (differArr.length === 0) {
      return true;
    }
    return false;
  }

  return (
    <div className={`${prefixCls}-clusterPublicNode`}>
      <div className={`${prefixCls}-clusterPublicNode-header`}>
        <Button
          size="small"
          icon={!expand ? 'expand_more' : 'expand_less'}
          onClick={() => changeExpand(!expand)}
        />
        <span>公网节点配置</span>
        <Tips helpText="help" />
      </div>
      <div
        className={`${prefixCls}-clusterPublicNode-form`}
        style={{ display: expand ? 'block' : 'none' }}
      >
        <Form
          dataSet={publicNodeDs}
          columns={6}
        >
          <TextField name="hostIp" colSpan={3} />
          <TextField name="hostPort" colSpan={3} />
          <SelectBox
            name="authType"
            colSpan={6}
            className={`${prefixCls}-nodesCreate-right-authType`}
          />
          <TextField name="username" colSpan={3} />
          {
            publicNodeDs.current && publicNodeDs.current.get('authType') !== 'publickey' && <Password name="password" reveal={false} colSpan={3} />
          }
        </Form>
        {
          publicNodeDs.current.get('authType') && publicNodeDs.current.get('authType') === 'publickey' && (
            <div className={`${prefixCls}-clusterPublicNode-form-yaml`}>
              <span>
                密钥
              </span>
              <YamlEditor
                readOnly={false}
                newLine
                // value={publicNodeDs.current.get('password')}
                onValueChange={(valueYaml) => {
                  publicNodeDs.current.set('password', valueYaml);
                }}
                modeChange={false}
                showError={false}
              />
              <span>
                请输入密钥。
              </span>
            </div>
          )
        }
        {publicNodeDs && checkHasAllConnectFieldsFilled() && (
          <div className={`${prefixCls}-clusterPublicNode-connect ${['wait', 'linkError'].includes(publicNodeDs.current.get('status')) && `${prefixCls}-clusterPublicNode-connect-uncheck`}`}>
            <TestConnect handleTestConnection={handleTestConnection} nodeRecord={publicNodeDs.current} />
            {
              renderLinkStatusMes()
            }
          </div>
        )}
      </div>
    </div>
  );
});

export default PublicNode;
