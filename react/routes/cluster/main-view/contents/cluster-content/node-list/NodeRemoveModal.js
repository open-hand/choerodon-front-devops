import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Form, SelectBox, Select, Spin,
} from 'choerodon-ui/pro';
import { axios } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';

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

  async function handleSubmit() {
    try {
      const res = await contentStore.deleteNode(projectId, nodeId);
      if (res && res.failed) {
        return false;
      }
      afterOk();
      return true;
    } catch (error) {
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
