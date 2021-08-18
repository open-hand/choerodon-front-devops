import React, { useEffect } from 'react';
import { CONSTANTS } from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';

const appCreateModalKey = Modal.key();

const AppCreateForm = () => {
  useEffect(() => {

  });
  return (
    <div>
      this is a appCreateForm
    </div>
  );
};

export function openAppCreateModal() {
  Modal.open({
    key: appCreateModalKey,
    title: '创建应用',
    children: <AppCreateForm />,
    okText: '确定',
    drawer: true,
    style: {
      width: 'calc(100vw - 3.52rem)',
    },
    // onOk: handleOk,
    // onCancel: handleOk,
  });
}
