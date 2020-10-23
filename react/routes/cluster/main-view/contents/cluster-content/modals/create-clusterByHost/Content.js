import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField, TextArea, Form, Modal, message, Button,
} from 'choerodon-ui/pro';
import { forEach, toUpper } from 'lodash';
import { useFormStore } from './stores';
import NodesCreate from '../create-nodes';
import TestConnectFinal from './components/test-connect-final';

function CreateClusterHostForm() {
  const [connectObj, setConnectObj] = useState();

  const {
    modal,
    formDs,
    nodesDs,
    nodesTypeDs,
    // mainStore,
    // afterOk,
    formatMessage,
    intlPrefix,
    isEdit,
    prefixCls,
  } = useFormStore();

  // if (isEdit) {
  //   formDs.query();
  // }

  const openNoticeEvenModal = () => {
    Modal.open({
      key: Modal.key(),
      title: '注意',
      children: '您创建的集群中Etcd类型节点为偶数个，Etcd官方建议Etcd集群服务器个数为奇数个（比如1、3、5）以防止脑裂',
      okText: '仍然创建',
      okProps: {
        color: 'red',
      },
      cancelText: '返回修改',
      cancelProps: {
        color: 'dark',
      },
    });
  };

  function checkHasAllNodeType() {
    const { devopsClusterNodeVOList } = formDs && formDs.children;
    const mainData = devopsClusterNodeVOList && devopsClusterNodeVOList.toData();
    const nodeHasObj = {
      master: false,
      etcd: false,
      worker: false,
    };

    forEach(mainData, (item) => {
      const nodeTypesArr = item?.type;
      if (nodeTypesArr) {
        for (const key in nodeHasObj) {
          if (!nodeHasObj[key] && nodeTypesArr.includes(key)) {
            nodeHasObj[key] = true;
          }
        }
      }
    });

    return nodeHasObj.master && nodeHasObj.etcd && nodeHasObj.worker;
  }

  function checkNodesEtcdIsEven(tempArr) {
    let num = 0;
    if (tempArr && tempArr.length) {
      forEach(tempArr, (item) => {
        if (item?.type.includes('etcd')) {
          num += 1;
        }
      });
    }
    // 判断是否为奇数
    return !!(num % 2);
  }

  // eslint-disable-next-line consistent-return
  async function handleSubmit() {
    try {
      nodesDs.forEach(async (nodeRecord) => {
        const res = await nodeRecord.validate();
        if (!res) {
          nodeRecord.set('hasError', true);
        }
      });
      const result = await formDs.validate();
      if (!result) {
        message.error('请完善集群信息');
      }
      if (result) {
        const mainData = formDs.toData()[0];
        const hasAllNodeTypes = checkHasAllNodeType();
        // 首先需要校验创建集群时，需至少包含1个master+1个etcd+1个worker类型的节点。
        if (!hasAllNodeTypes) {
          message.error('创建集群时，需至少包含1个master+1个etcd+1个worker类型的节点。');
          return false;
        }
        const isEven = checkNodesEtcdIsEven(mainData?.devopsClusterNodeVOList || []);
        if (!isEven) {
          openNoticeEvenModal();
          return false;
        }
        setConnectObj({
          status: 'operating',
          configuration: {
            status: 'success',
            errorMessage: null,
          },
          system: {
            status: 'success',
            errorMessage: null,
          },
          memory: {
            status: 'operating',
            errorMessage: null,
          },
          cpu: {
            status: 'wait',
            errorMessage: null,
          },
        });
      }
      // }
      return false;
    } catch (error) {
      throw new Error(error);
      // return false;
    }
    // }
    // try {
    //   if ((await formDs.submit()) !== false) {
    //     // if (!isEdit) {
    //     //   const dataObj = JSON.parse(JSON.stringify(mainStore));
    //     //   openActivate(dataObj.responseData);
    //     // }
    //     // afterOk();
    //     // return true;
    //   }
    //   return false;
    // } catch (e) {
    //   return false;
    // }
  }

  modal.handleOk(handleSubmit);

  return (
    <div className={`${prefixCls}-createByHost`}>
      <Form
        dataSet={formDs}
        columns={6}
      >
        <TextField name="name" colSpan={2} />
        <TextField name="code" disabled={isEdit} colSpan={2} />
        <TextArea name="description" resize="vertical" colSpan={2} />
      </Form>
      <NodesCreate
        prefixCls={prefixCls}
        formatMessage={formatMessage}
        intlPrefix={intlPrefix}
        nodesTypeDs={nodesTypeDs}
        nodesDs={nodesDs}
        parentModal={modal}
      />
      {connectObj && <TestConnectFinal connectRecord={connectObj} />}
    </div>
  );
}

export default observer(CreateClusterHostForm);
