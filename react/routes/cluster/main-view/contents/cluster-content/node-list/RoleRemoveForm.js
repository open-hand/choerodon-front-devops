import React, { useEffect, useMemo, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { axios } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';

const RemoveForm = observer(({
  nodeName,
  modal,
  nodeId,
  projectId,
  roleType,
  contentStore,
}) => {
  const [isLoading, setLoading] = useState(true);

  const modalProps = useMemo(() => ({
    okProps: {
      color: 'red',
    },
    cancelProps: {
      color: 'dark',
    },
    footer: (okbtn, cancelbtn) => (
      <>
        {cancelbtn}
        {okbtn}
      </>
    ),
  }), [nodeId, roleType, projectId]);

  async function loadPermission() {
    try {
      const res = await axios.get(contentStore.getDeleteRolePemissionUrl(projectId, nodeId));
      if (res && res.failed) {
        return res;
      }
      setLoading(false);
      modal.update(modalProps);
      return true;
    } catch (error) {
      return error;
    }
  }

  function handleSubmit() {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  useEffect(() => {
    loadPermission();
  }, []);

  modal.handleOk(handleSubmit);

  if (isLoading) {
    return <Spin spinning />;
  }

  return (
    <div>
      <p>{`确认要移除节点"${nodeName}"的【${roleType}】角色吗?`}</p>
    </div>
  );
});

export default RemoveForm;
