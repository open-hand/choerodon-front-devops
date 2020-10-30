import React, { useEffect, useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';

const RemoveForm = observer(({
  nodeName,
  modal,
  nodeId,
  projectId,
  roleType,
  contentStore,
  afterOk,
}) => {
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

  useEffect(() => {
    modal.update(modalProps);
  }, []);

  modal.handleOk(handleSubmit);

  return (
    <div>
      <p>{`确认要移除节点"${nodeName}"的【${roleType}】角色吗?`}</p>
    </div>
  );
});

export default RemoveForm;
