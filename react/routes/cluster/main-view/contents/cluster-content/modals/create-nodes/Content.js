import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField, TextArea, Form, Select, Button, SelectBox, Password, Icon,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import NewTips from '@/components/new-tips';
import { useFormStore } from './stores';
import TestConnect from './components/test-connect';

const { Option } = Select;

function CreateNodesForm() {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const {
    nodesDs,
    // mainStore,
    // afterOk,
    formatMessage,
    intlPrefix,
    isEdit,
    nodesTypeDs,
    prefixCls,
    modal,
    parentModal,
  } = useFormStore();

  useEffect(() => {
    nodesDs && nodesDs.data && setSelectedRecord(nodesDs.data[0]);
  }, [nodesDs]);

  function handleSubmit() {
  }

  function handleAddNewNode() {
    nodesDs.create();
  }

  function handleRemove(record, index) {
    nodesDs.remove(record);
    if (nodesDs.data?.length && record?.id === selectedRecord?.id) {
      const tempIndex = index > nodesDs.data.length - 1 ? index - 1 : index;
      setSelectedRecord(nodesDs.data[tempIndex]);
    }
  }

  async function handleTestConnection() {
    try {
      const validate = selectedRecord && await selectedRecord.validate();
      const record = selectedRecord;
      // 单独再次校验密码是因为：修改时无任何操作，formDs.validate() 返回为true
      if (!validate || !record || await record.getField('password').checkValidity() === false) {
        return false;
      }
      selectedRecord.set('status', 'operating');
      parentModal && parentModal.update({
        okProps: {
          disabled: true,
        },
      });

      setTimeout(() => {
        selectedRecord.set('status', 'success');
        parentModal && parentModal.update({
          okProps: {
            disabled: false,
          },
        });
      }, [2000]);
    } catch (error) {
      selectedRecord.set('status', 'wait');
      throw new Error(error);
    }
    return true;
  }

  const renderNodetypeOpts = ({ value, text }) => {
    if (value === 'etcd') {
      return (
        <>
          <span>{text}</span>
          <NewTips showHelp helpText="提示" />
        </>
      );
    }
    return <span>{text}</span>;
  };

  modal && modal.handleOk(handleSubmit);

  return (
    <div className={`${prefixCls}-nodesCreate`}>
      <div className={`${prefixCls}-nodesCreate-left`}>
        <main>
          {
            map(nodesDs.data, (nodesRecord, index) => (
              <div
                className={
                  `${prefixCls}-nodesCreate-left-item 
                   ${nodesRecord?.id === selectedRecord?.id && `${prefixCls}-nodesCreate-left-item-selected`}`
                }
                onClick={() => setSelectedRecord(nodesRecord)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(nodesRecord, index);
                        }}
                      />
                    )
                  }
                </Form>
                {
                  nodesRecord.get('hasError') && (
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

      {nodesDs.data.length && selectedRecord ? (
        <div className={`${prefixCls}-nodesCreate-right`}>
          <Form
            columns={6}
            record={selectedRecord}
          >
            <TextField name="hostIp" colSpan={3} />
            <TextField name="sshPort" colSpan={3} />
            <SelectBox name="authType" colSpan={6} className={`${prefixCls}-nodesCreate-right-authType`} />
            <TextField name="username" colSpan={3} />
            {
              selectedRecord && selectedRecord.get('authType') === 'publickey' ? (
                <TextField name="password" colSpan={3} />
              ) : <Password name="password" reveal={false} colSpan={3} />
            }
          </Form>
          <TestConnect handleTestConnection={handleTestConnection} nodeRecord={selectedRecord} />

          <Form
            columns={6}
            record={selectedRecord}
          >
            <SelectBox
              name="type"
              colSpan={6}
              multiple={!modal}
              className={`${prefixCls}-nodesCreate-right-nodeType`}
              optionRenderer={renderNodetypeOpts}
            >
              {
                map(nodesTypeDs && nodesTypeDs.toData(), (item, index) => {
                  const { value, text } = item;
                  if (value === 'etcd') {
                    if (modal) return null;
                    return (
                      <Option value={value} key={`${index}-${text}`}>
                        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '2px' }}>{text}</span>
                          <NewTips showHelp helpText="提示" />
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
              }
            </SelectBox>
          </Form>
        </div>
      ) : ''}
    </div>
  );
}

export default observer(CreateNodesForm);
