/* eslint-disable max-len */
import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField, TextArea, Form, Select, Button, SelectBox, Password, Icon, message, Spin,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import NewTips from '@/components/new-tips';
import YamlEditor from '@/components/yamlEditor';
import { useFormStore } from './stores';

const { Option } = Select;

function CreateNodesForm() {
  // const [nodeStore.getSelectedRecord, nodeStore.setSelectedRecord] = useState(null);

  const {
    nodesDs,
    // mainStore,
    afterOk,
    formatMessage,
    intlPrefix,
    isEdit,
    nodesTypeDs,
    prefixCls,
    modal, // 单独打开这个组件弹窗传进来的modal
    parentModal, // 这个是父组件传过来的modal，此为子组件的时候
    nodeStore,
    projectId,
    createHostClusterMainStore,
    clusterId, // 顶部添加节点的按钮需要这个集群id从而对应到创建这个集群的节点
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
      // createHostClusterMainStore.setModalErrorMes('请完善节点信息');
      message.error('请完善节点信息');
      return false;
    }
    try {
      const res = await nodesDs.submit();
      if (res) {
        modal.close();
        afterOk();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async function handleAddNewNode() {
    const record = await nodesDs.create();
    nodeStore.setSelectedRecord(record);
    document.querySelector(`#node${record.index}`) && document.querySelector(`#node${record.index}`).scrollIntoView({
      block: 'start',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }

  function handleRemove(record, index) {
    nodesDs.remove(record);
    if (nodesDs.data?.length && record?.id === nodeStore.getSelectedRecord.id) {
      const tempIndex = index > nodesDs.data.length - 1 ? index - 1 : index;
      nodeStore.setSelectedRecord(nodesDs.data[tempIndex]);
    }
  }

  const renderNodetypeOpts = useCallback(({ value, text }) => {
    if (value === 'etcd') {
      return (
        <span>{text}</span>
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

  modal && modal.handleOk(handleSubmit);

  return (
    <>
      <div
        className={`${prefixCls}-nodesCreate`}
        style={{ width: `${modal ? '90%' : '100%'}` }}
      >
        {!modal && (
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
                id={`node${index}`}
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
                  (nodesRecord.get('hasError')) && (
                  <Icon
                    type="info"
                    className={`${prefixCls}-nodesCreate-left-item-errorIcon`}
                  />
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
        )}

        {nodesDs.data.length && nodeStore.getSelectedRecord ? (
          <div
            className={`${prefixCls}-nodesCreate-right`}
            style={{ padding: modal ? 0 : '11px 20px' }}
          >
            <Form
              columns={6}
              record={nodeStore.getSelectedRecord}
            >
              {
                modal && <TextField name="name" colSpan={3} />
              }
              <TextField name="hostIp" colSpan={3} />
              <TextField name="hostPort" colSpan={3} />
              <SelectBox
                name="authType"
                colSpan={6}
                className={`${prefixCls}-nodesCreate-right-authType`}
                newLine={!!modal}
              />
              <TextField name="username" colSpan={3} />
              {
                nodeStore.getSelectedRecord && nodeStore.getSelectedRecord.get('authType') !== 'publickey' && <Password name="password" reveal={false} colSpan={3} />
              }
            </Form>
            {
              nodeStore.getSelectedRecord.get('authType') && nodeStore.getSelectedRecord.get('authType') === 'publickey' && (
              <div className={`${prefixCls}-clusterPublicNode-form-yaml `}>
                <span>
                  密钥
                </span>
                <YamlEditor
                  readOnly={false}
                  newLine
                  value={nodeStore.getSelectedRecord.get('password')}
                  onValueChange={(valueYaml) => nodeStore.getSelectedRecord.set('password', valueYaml)}
                  modeChange={false}
                  showError={false}
                />
              </div>
              )
              }
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
    </>
  );
}

export default observer(CreateNodesForm);
