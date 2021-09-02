import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import AppCreateForm from '@/routes/app-center-pro/components/OpenAppCreateModal';

const appCreateModalKey = Modal.key();

const {
  MODAL_WIDTH: {
    MAX,
  },
} = CONSTANTS;

function openAppCreateModal(refresh: Function, isDeploy: boolean, envId: string): void;
function openAppCreateModal(refresh: Function): void;
function openAppCreateModal(refresh: Function, isDeploy?: boolean, envId?: string) {
  Modal.open({
    key: appCreateModalKey,
    title: '创建应用',
    children: (
      <AppCreateForm
        refresh={refresh}
        isDeploy={isDeploy || false}
        envId={envId}
      />
    ),
    okText: '下一步',
    drawer: true,
    style: {
      width: MAX,
    },
    // onCancel: handleOk,
  });
}

export { openAppCreateModal };
