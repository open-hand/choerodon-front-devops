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

export function openAppCreateModal(refresh: Function, isDeploy?: boolean) {
  Modal.open({
    key: appCreateModalKey,
    title: '创建应用',
    children: (
      <AppCreateForm
        refresh={refresh}
        isDeploy={isDeploy || false}
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
