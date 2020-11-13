import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Form, SelectBox, Select, Spin, Button,
} from 'choerodon-ui/pro';
import { axios } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';

let timer;

const NodeRemove = observer(({
  nodeName,
  modal,
  nodeId,
  projectId,
  formatMessage,
  intlPrefix,
  contentStore,
  afterOk,
  roleType,
}) => {
  const [isLoading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => function () {
    if (timer) {
      clearInterval(timer);
    }
  }, []);

  const failedProps = {
    title: '无法删除',
    onOk: () => modal.close(),
    okText: formatMessage({ id: 'iknow' }),
    footer: (okbtn, cancelbtn) => (
      <>
        {okbtn}
      </>
    ),
  };

  const successProps = {
    okProps: {
      color: 'red',
    },
    cancelProps: {
      color: 'dark',
    },
    onOk: handleSubmit,
    okText: formatMessage({ id: 'delete' }),
    title: formatMessage({ id: `${intlPrefix}.node.modal.canDelete` }),

    footer: (okbtn, cancelbtn) => (
      <>
        {cancelbtn}
        {okbtn}
      </>
    ),
  };

  const loadingModalProps = {
    cancelProps: {
      color: 'dark',
    },
    title: formatMessage({ id: `${intlPrefix}.node.modal.canDelete` }),
    footer: (okbtn, cancelbtn) => (
      <>
        {cancelbtn}
        <Button color="red" loading>
          删除
        </Button>
      </>
    ),
  };

  const loadingModalFailedProps = {
    okProps: {
      color: 'red',
      loading: false,
    },
    cancelProps: {
      color: 'dark',
    },
    onOk: handleSubmit,
    okText: formatMessage({ id: 'delete' }),
    title: formatMessage({ id: `${intlPrefix}.node.modal.canDelete` }),
    footer: (okbtn, cancelbtn) => (
      <>
        {cancelbtn}
        {okbtn}
      </>
    ),
  };

  async function loadPermission() {
    try {
      const res = await contentStore.getDeleteRolePemissionUrl(projectId, nodeId, 1);
      if (res && res.failed) {
        return res;
      }
      setLoading(false);
      modal.update(res ? successProps : failedProps);
      setMessage(res ? `确认删除节点${nodeName}吗?` : `节点"${nodeName}为集群下唯一的worker节点，无法删除"`);
      return true;
    } catch (error) {
      return error;
    }
  }

  const handleDeleteFinal = (id) => {
    modal.update(loadingModalProps);
    timer = setInterval(async () => {
      try {
        const res = await contentStore.handleNodeIdDelele(projectId, id);
        if (res && res.failed) {
          return false;
        }
        const { status } = res;
        if (res && status !== 'operating') {
          clearInterval(timer);
          modal.close();
          afterOk();
        }
        return false;
      } catch (error) {
        modal.update(loadingModalFailedProps);
        return true;
      }
    }, 2000);
  };

  async function handleSubmit() {
    try {
      const res = await contentStore.deleteNode(projectId, nodeId);
      if (res && res.failed) {
        modal.update(loadingModalFailedProps);
        return false;
      }
      handleDeleteFinal(res);
      return false;
    } catch (error) {
      modal.update(loadingModalFailedProps);
      return false;
    }
  }

  useEffect(() => {
    loadPermission();
  }, []);

  if (isLoading) {
    return <Spin spinning />;
  }

  return (
    <div>
      {message}
    </div>
  );
});

export default NodeRemove;
