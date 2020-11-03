import React, { useEffect, useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui/pro/lib';

const RemoveForm = observer(({
  nodeName,
  modal,
  nodeId,
  projectId,
  roleType,
  contentStore,
  afterOk,
  formatMessage,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const successModalProps = {
    okProps: {
      color: 'red',
    },
    cancelProps: {
      color: 'dark',
    },
    onOk: handleSubmit,
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

  async function handleSubmit() {
    try {
      const res = await contentStore.removeRole(projectId, nodeId, roleType === 'master' ? 4 : 2);
      if (res && res.failed) {
        return false;
      }
      afterOk();
      return true;
    } catch (error) {
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
