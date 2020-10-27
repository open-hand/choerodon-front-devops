/* eslint-disable max-len */
import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField, TextArea, Form, Select, Button, SelectBox, Password, Icon, message, Spin,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import NewTips from '@/components/new-tips';
import { pick } from 'lodash';
import { useFormStore } from './stores';
import TestConnect from './components/test-connect';

const { Option } = Select;

function CreateNodesForm() {
  // const [nodeStore.getSelectedRecord, nodeStore.setSelectedRecord] = useState(null);

  const {
    nodesDs,
    // mainStore,
    // afterOk,
    formatMessage,
    intlPrefix,
    isEdit,
    nodesTypeDs,
    prefixCls,
    modal, // 单独打开这个组件弹窗传进来的modal
    parentModal, // 这个是父组件传过来的modal，此为子组件的时候
    nodeStore,
    projectId,
    modalStore,
  } = useFormStore();

  // nodeStore.setSelectedRecord设置选中的record用来渲染用
  useEffect(() => {
    // 刚开始默认选中第一条数据
    nodesDs && nodesDs.data && nodeStore.setSelectedRecord(nodesDs.data[0]);
  }, [nodesDs]);

  async function handleSubmit() {
    nodesDs.forEach(async (nodeRecord) => {
      const res = await nodeRecord.validate();
      if (!res) {
        nodeRecord.set('hasError', true);
      }
    });
    const result = await nodesDs.validate();
    if (!result) {
      modalStore.setModalErrorMes('请完善节点信息');
      return false;
    }
    return true;
  }

  function handleAddNewNode() {
    nodesDs.create();
  }

  function handleRemove(record, index) {
    nodesDs.remove(record);
    if (nodesDs.data?.length && record?.id === nodeStore.getSelectedRecord.id) {
      const tempIndex = index > nodesDs.data.length - 1 ? index - 1 : index;
      nodeStore.setSelectedRecord(nodesDs.data[tempIndex]);
    }
  }

  async function checkConnectValidate() {
    const tempRecord = nodeStore.getSelectedRecord;
    const hasIp = tempRecord && await tempRecord.getField('hostIp').checkValidity();
    const hasPort = tempRecord && await tempRecord.getField('sshPort').checkValidity();
    const hasAccountType = tempRecord && await tempRecord.getField('authType').checkValidity();
    const hasUsername = tempRecord && await tempRecord.getField('username').checkValidity();
    const hasPassword = tempRecord && await tempRecord.getField('password').checkValidity();
    return hasIp && hasPort && hasAccountType && hasUsername && hasPassword;
  }

  async function handleTestConnection() {
    const tempRecord = nodeStore.getSelectedRecord;

    const validate = await checkConnectValidate();

    // 单独再次校验密码是因为：修改时无任何操作，formDs.validate() 返回为true
    if (!validate || !tempRecord || await tempRecord.getField('password').checkValidity() === false) {
      return false;
    }
    tempRecord.set('status', 'operating');
    // 再进行节点的连接测试的时候需要去把父组件传过来的modal给禁用不让他关闭
    parentModal && parentModal.update({
      okProps: {
        loading: true,
      },
      cancelProps: {
        disabled: true,
      },
    });

    const data = pick(tempRecord.data, ['sshPort', 'password', 'hostIp', 'username', 'authType']);

    try {
      const res = await nodeStore.checkNodeConnect(projectId, data);
      if (res && res.failed) {
        return false;
      }
      tempRecord.set('status', res ? 'success' : 'failed');
    } catch (error) {
      tempRecord.set('status', 'linkError');
    }
    parentModal && parentModal.update({
      okProps: {
        loading: false,
      },
      cancelProps: {
        disabled: false,
      },
    });
    return true;
  }

  const renderNodetypeOpts = useCallback(({ value, text }) => {
    if (value === 'etcd') {
      return (
        <>
          <span>{text}</span>
          <NewTips showHelp helpText="提示" />
        </>
      );
    }
    return <span>{text}</span>;
  }, []);

  const renderRoleOpts = useCallback(() => (
    map(nodesTypeDs && nodesTypeDs.toData(), (item, index) => {
      const { value, text } = item;
      if (value === 'etcd') {
        if (modal) return null;
        return (
          <Option value={value} key={`${index}-${text}`}>
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ marginRight: '2px' }}>{text}</span>
              <NewTips showHelp helpText="etcd类型的节点建议为单数， 以避免脑裂" />
            </div>
          </Option>
        );
      }
      return (
        <Option value={value} key={`${index}-${text}`}>
          <span>{text}</span>
        </Option>
      );
    })
  ), [nodesTypeDs]);

  const renderLinkStatusMes = useCallback(() => {
    const status = nodeStore.getSelectedRecord && nodeStore.getSelectedRecord.get('status');
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
  }, [nodeStore.getSelectedRecord]);

  modal && modal.handleOk(handleSubmit);

  return (
    <>
      <div className={`${prefixCls}-nodesCreate`}>
        <div className={`${prefixCls}-nodesCreate-left`}>
          <main>
            {
            map(nodesDs.data, (nodesRecord, index) => (
              <div
                className={
                  `${prefixCls}-nodesCreate-left-item 
                   ${nodesRecord?.id === nodeStore.getSelectedRecord?.id && `${prefixCls}-nodesCreate-left-item-selected`}`
                }
                onClick={() => nodeStore.setSelectedRecord(nodesRecord)}
                role="none"
              >
                <Form
                  columns={10}
                  record={nodesRecord}
                  key={nodesRecord.id}
                >
                  <TextField name="name" colSpan={nodesDs.data.length > 1 ? 7 : 9} />
                  {
                    nodesDs.data.length > 1 && (
                      <Button
                        funcType="flat"
                        icon="delete"
                        shape="circle"
                        colSpan={2}
                        className={`${prefixCls}-nodesCreate-left-item-selected-btn`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(nodesRecord, index);
                        }}
                      />
                    )
                  }
                </Form>
                {
                  (nodesRecord.get('hasError') || (['failed', 'wait', 'linkError'].includes(nodesRecord.get('status')))) && (
                  <Icon
                    type="info"
                    className={`${prefixCls}-nodesCreate-left-item-errorIcon`}
                  />
                  )
                }
                {
                  !nodesRecord.get('hasError') && nodesRecord.get('status') === 'operating' && (
                    <Spin spinning size="small" className={`${prefixCls}-nodesCreate-left-item-errorIcon`} />
                  )
                }
              </div>
            ))
          }
          </main>
          <Button
            funcType="flat"
            icon="add"
            shape="circle"
            color="primary"
            onClick={handleAddNewNode}
            style={{ marginLeft: '20px', marginTop: '10px' }}
          >
            添加节点
          </Button>
        </div>

        {nodesDs.data.length && nodeStore.getSelectedRecord ? (
          <div className={`${prefixCls}-nodesCreate-right`}>
            <Form
              columns={6}
              record={nodeStore.getSelectedRecord}
            >
              <TextField name="hostIp" colSpan={3} />
              <TextField name="sshPort" colSpan={3} />
              <SelectBox name="authType" colSpan={6} className={`${prefixCls}-nodesCreate-right-authType`} />
              <TextField name="username" colSpan={3} />
              {
              nodeStore.getSelectedRecord && nodeStore.getSelectedRecord.get('authType') === 'publickey' ? (
                <TextField name="password" colSpan={3} />
              ) : <Password name="password" reveal={false} colSpan={3} />
            }
            </Form>
            <div className={`${prefixCls}-nodesCreate-connect ${['wait', 'linkError'].includes(nodeStore.getSelectedRecord.get('status')) && `${prefixCls}-nodesCreate-connect-uncheck`}`}>
              <TestConnect handleTestConnection={handleTestConnection} nodeRecord={nodeStore.getSelectedRecord} />
              {
                renderLinkStatusMes()
              }
            </div>
            <Form
              columns={6}
              record={nodeStore.getSelectedRecord}
            >
              <SelectBox
                name="role"
                colSpan={6}
                multiple={!modal}
                className={`${prefixCls}-nodesCreate-right-nodeType`}
                optionRenderer={renderNodetypeOpts}
              >
                {
                  renderRoleOpts()
                }
              </SelectBox>
            </Form>
          </div>
        ) : ''}
      </div>
      {
        modal && modalStore.modalErrorMes && (
        <span className={`${prefixCls}-nodesCreate-modal-errorMes`}>
          {modalStore.modalErrorMes}
        </span>
        )
      }
    </>
  );
}

export default observer(CreateNodesForm);
