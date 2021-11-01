import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TextField,
  TextArea,
  Form,
  Modal,
  message,
  Button,
  Icon,
} from 'choerodon-ui/pro';
import { forEach, toUpper } from 'lodash';

import { Alert } from 'choerodon-ui';

import Tips from '@/components/new-tips';

import { useFormStore } from './stores';

import NodesCreate from '../create-nodes';

import NodePublicCreate from '../create-public-node';

import TestConnectFinal from './components/test-connect-final';

let confirmModal;
let timer;

function CreateClusterHostForm() {
  const [connectObj, setConnectObj] = useState();

  const {
    modal,
    formDs,
    nodesDs,
    nodesTypeDs,
    formatMessage,
    intlPrefix,
    isEdit,
    prefixCls,
    clusterByHostStore,
    projectId,
    createHostClusterMainStore,
    publicNodeDs,
    afterOk,
  } = useFormStore();

  useEffect(
    () => function () {
      timer && clearInterval(timer);
    },
    [],
  );

  // if (isEdit) {
  //   formDs.query();
  // }

  const openNoticeEvenModal = () => {
    confirmModal = Modal.open({
      key: Modal.key(),
      title: '注意',
      children:
        '您创建的集群中Etcd类型节点为偶数个，Etcd官方建议Etcd集群服务器个数为奇数个（比如1、3、5）以防止脑裂',
      footer: (okbtn, cancelBtn) => (
        <div>
          <Button
            color="dark"
            onClick={() => {
              confirmModal.close();
            }}
          >
            返回修改
          </Button>
          <Button
            color="red"
            onClick={() => {
              confirmModal.close();
              postMainData();
            }}
            style={{ marginLeft: '34px' }}
          >
            仍然创建
          </Button>
        </div>
      ),
    });
  };

  function checkHasAllNodeType() {
    const { devopsClusterInnerNodeVOList } = formDs && formDs.children;
    const mainData = devopsClusterInnerNodeVOList && devopsClusterInnerNodeVOList.toData();
    const nodeHasObj = {
      master: false,
      etcd: false,
      worker: false,
    };

    forEach(mainData, (item) => {
      const nodeTypesArr = item?.role;
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
        if (item?.role.includes('etcd')) {
          num += 1;
        }
      });
    }
    // 判断是否为奇数
    return !!(num % 2);
  }

  function checkNodeHasError() {
    nodesDs.forEach(async (nodeRecord) => {
      const res = await nodeRecord.validate();
      if (!res) {
        nodeRecord.set('hasError', true);
      }
    });
  }

  function modalUpDateLoadingFalse() {
    modal.update({
      cancelProps: {
        disabled: false,
      },
      okProps: {
        loading: false,
      },
    });
  }

  function modalUpDateLoadingTrue() {
    modal.update({
      cancelProps: {
        disabled: true,
      },
      okProps: {
        loading: true,
      },
    });
  }

  function scrollTimer() {
    document.querySelector('#loadingProgress') && document.querySelector('#loadingProgress').scrollIntoView({
      block: 'start',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }

  // 所有节点检测连通性
  function goTimerConnect(clusterString) {
    timer = setInterval(async () => {
      let nodeStatusRes;
      try {
        nodeStatusRes = await clusterByHostStore.checkConnect(
          projectId,
          clusterString,
        );
        if (nodeStatusRes && nodeStatusRes.failed) {
          if (timer) clearInterval(timer);
          setConnectObj(null);
          modalUpDateLoadingFalse();
          return false;
        }
        const { status } = nodeStatusRes;
        setConnectObj(nodeStatusRes);
        scrollTimer();
        // 如果状态成功,
        if (status === 'success') {
          clearInterval(timer);
          setTimeout(() => {
            modal.close();
            afterOk();
          }, 2000);
        }
        // 如果失败
        if (status === 'failed') {
          clearInterval(timer);
          message.error('测试节点连通性失败');
          // 清除loading和disabled
          modalUpDateLoadingFalse();
        }
        return true;
      } catch (error) {
        if (timer) clearInterval(timer);
        scrollTimer();
        setConnectObj(null);
        // 清除loading和disabled
        modalUpDateLoadingFalse();
        return true;
      }
    }, 2000);
  }

  async function postMainData() {
    try {
      // 首先让弹窗loading
      modalUpDateLoadingTrue();
      // 先把数据发给后端
      const res = await formDs.submit();
      if (typeof res === 'object' && res.failed) {
        modalUpDateLoadingFalse();
        return res;
      }
      if (res) {
        modalUpDateLoadingTrue();
        // 开始检测节点的连通性
        goTimerConnect(res[0].clusterString);
        return true;
      }
      return false;
    } catch (error) {
      modalUpDateLoadingFalse();
      return true;
    }
  }

  // eslint-disable-next-line consistent-return
  async function handleSubmit() {
    // 为了在界面上的后面显示出没有检验通过的record
    checkNodeHasError();
    const result = await formDs.validate();
    if (!result) {
      message.error('请检查集群信息');
      // createHostClusterMainStore.setModalErrorMes('请检查集群信息');
    }
    if (result) {
      const mainData = formDs.toData()[0];
      const hasAllNodeTypes = checkHasAllNodeType();
      // 首先需要校验创建集群时，需至少包含1个master+1个etcd+1个worker类型的节点。
      if (!hasAllNodeTypes) {
        message.error(
          '创建集群时，需至少包含1个master+1个etcd+1个worker类型的节点。',
        );
        return false;
      }
      const isEven = checkNodesEtcdIsEven(
        mainData?.devopsClusterInnerNodeVOList || [],
      );
      // 这个时候检验etcd的节点个数，偶数的话就会弹窗告诉你东西
      if (!isEven) {
        openNoticeEvenModal();
        return false;
      }
      // 之后去把数据发给后端
      postMainData();
    }
    return false;
  }

  modal.handleOk(handleSubmit);

  return (
    <>
      <div className={`${prefixCls}-createByHost`}>
        <div className={`${prefixCls}-createByHost-headerForm`}>
          <Form dataSet={formDs} columns={6}>
            <TextField name="name" colSpan={2} />
            <TextField name="code" disabled={isEdit} colSpan={2} />
            <TextArea newLine colSpan={4} className={`${prefixCls}-createByHost-headerForm-desc`} name="description" resize="vertical" />
            <Alert
              newLine
              colSpan={4}
              message="注意：每台节点系统必须关闭sudo命令输入密码限制。"
              type="warning"
              showIcon
            />
          </Form>
        </div>
        <div className={`${prefixCls}-createByHost-section`}>
          <header>
            <span>
              节点配置
            </span>
            <Tips helpText="集群中须至少含有1个master节点+1个etcd节点+1个worker节点" />
          </header>
          <NodesCreate
            prefixCls={prefixCls}
            formatMessage={formatMessage}
            intlPrefix={intlPrefix}
            nodesTypeDs={nodesTypeDs}
            nodesDs={nodesDs}
            parentModal={modal}
          />
        </div>
        <NodePublicCreate
          prefixCls={prefixCls}
          formatMessage={formatMessage}
          intlPrefix={intlPrefix}
          parentModal={modal}
          publicNodeDs={publicNodeDs}
          nodesDs={nodesDs}
          createHostClusterMainStore={createHostClusterMainStore}
          projectId={projectId}
        />
        {connectObj && <TestConnectFinal connectRecord={connectObj} />}
      </div>
    </>
  );
}

export default observer(CreateClusterHostForm);
