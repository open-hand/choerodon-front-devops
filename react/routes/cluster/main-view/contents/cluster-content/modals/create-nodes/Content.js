import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField, TextArea, Form, Modal, Button, SelectBox, Password, CheckBox,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import { useFormStore } from './stores';
import TestConnect from './components/test-connect';

function CreateNodesForm() {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const {
    nodesDs,
    // mainStore,
    // afterOk,
    formatMessage,
    intlPrefix,
    isEdit,
    prefixCls,
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

      setTimeout(() => {
        selectedRecord.set('status', 'success');
      }, [2000]);
    } catch (error) {
      selectedRecord.set('status', 'wait');
      throw new Error(error);
    }
    return true;
  }

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
                  columns={5}
                  record={nodesRecord}
                  key={nodesRecord.id}
                >
                  <TextField name="name" colSpan={nodesDs.data.length > 1 ? 4 : 5} />
                  {
                    nodesDs.data.length > 1 && (
                      <Button
                        funcType="flat"
                        icon="delete"
                        shape="circle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(nodesRecord, index);
                        }}
                      />
                    )
                  }
                </Form>
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
            <TextField name="domain" colSpan={3} />
            <TextField name="port" colSpan={3} />
            <SelectBox name="authType" colSpan={6} className={`${prefixCls}-nodesCreate-right-authType`} />
            <TextField name="username" colSpan={3} />
            {
              selectedRecord && selectedRecord.current && selectedRecord.current.get('authType') === 'publickey' ? (
                <TextField name="password" colSpan={3} />
              ) : <Password name="password" reveal={false} colSpan={3} />
            }
          </Form>
          <TestConnect handleTestConnection={handleTestConnection} nodeRecord={selectedRecord} />
          <Form
            columns={6}
            record={selectedRecord}
          >
            <SelectBox name="nodeType" colSpan={6} multiple className={`${prefixCls}-nodesCreate-right-nodeType`} />
          </Form>
        </div>
      ) : ''}
    </div>
  );
}

export default observer(CreateNodesForm);
