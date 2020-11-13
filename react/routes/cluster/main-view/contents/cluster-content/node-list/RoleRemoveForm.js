import React, { useEffect, useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Spin, Button } from 'choerodon-ui/pro/lib';

let timer;

const RemoveForm = observer(({
  nodeName,
  modal,
  nodeId,
  projectId,
  roleType,
  contentStore,
  afterOk,
  formatMessage,
  intlPrefix,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => function () {
    if (timer) {
      clearInterval(timer);
    }
  }, []);

  const successModalProps = {
    okProps: {
      color: 'red',
    },
    cancelProps: {
      color: 'dark',
    },
    onOk: handleSubmit,
    okText: '移除',
    title: formatMessage({ id: `${intlPrefix}.node.action.removeRole` }),

    footer: (okbtn, cancelbtn) => (
      <>
        {cancelbtn}
        {okbtn}
      </>
    ),
  };

  const failedModalProps = {
    title: '无法移除',
    onOk: () => modal.close(),
    okText: formatMessage({ id: 'iknow' }),
    footer: (okbtn, cancelbtn) => (
      <>
        {okbtn}
      </>
    ),
  };

  const loadingModalProps = {
    cancelProps: {
      color: 'dark',
    },
    title: formatMessage({ id: `${intlPrefix}.node.action.removeRole` }),

    footer: (okbtn, cancelbtn) => (
      <>
        {cancelbtn}
        <Button color="red" loading>
          移除
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
    okText: '移除',
    onOk: handleSubmit,

    title: formatMessage({ id: `${intlPrefix}.node.action.removeRole` }),

    footer: (okbtn, cancelbtn) => (
      <>
        {cancelbtn}
        {okbtn}
      </>
    ),
  };

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
      const res = await contentStore.removeRole(projectId, nodeId, roleType === 'master' ? 4 : 2);
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

  async function loadPermission() {
    try {
      const res = await contentStore.getDeleteRolePemissionUrl(projectId, nodeId, roleType === 'master' ? 4 : 2);
      if (res && res.failed) {
        return false;
      }
      setLoading(false);
      if (!res) {
        modal.update(failedModalProps);
        setMessage(`集群下唯一的${roleType}角色无法移除`);
        return true;
      }
      setMessage(`确认要移除节点"${nodeName}"的【${roleType}】角色吗?`);
      modal.update(successModalProps);
      return true;
    } catch (error) {
      return error;
    }
  }

  useEffect(() => {
    loadPermission();
  }, []);

  if (loading) {
    return <Spin spinning />;
  }

  return (
    <div>
      <p>{message}</p>
    </div>
  );
});

export default RemoveForm;
