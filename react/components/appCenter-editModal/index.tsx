import { CONSTANTS } from '@choerodon/master';
import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import AppConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config';
import ContainerConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config';
import DeployGroupConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/deploy-group-config';
import HostAppConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/host-app-config';

function openAppConfigModal(data: string | object, refresh: Function) {
  Modal.open({
    title: '修改应用',
    key: Modal.key(),
    drawer: true,
    style: {
      width: CONSTANTS.MODAL_WIDTH.MAX,
    },
    children: (
      <AppConfig
        refresh={refresh}
        detail={data}
      />
    ),
    okText: '修改',
  });
}

function openContainerConfigModal(data: string | object, refresh: Function) {
  Modal.open({
    title: '修改应用',
    key: Modal.key(),
    drawer: true,
    style: {
      width: CONSTANTS.MODAL_WIDTH.MAX,
    },
    children: (
      <ContainerConfig
        refresh={refresh}
        detail={data}
      />
    ),
    okText: '修改',
  });
}

function openDeployGroupConfigModal(data: string | object, refresh: Function) {
  Modal.open({
    title: '修改应用',
    key: Modal.key(),
    drawer: true,
    style: {
      width: CONSTANTS.MODAL_WIDTH.MAX,
    },
    children: (
      <DeployGroupConfig
        refresh={refresh}
        detail={data}
      />
    ),
    okText: '修改',
  });
}

function openHostAppConfigModal(data: string | object, refresh: Function) {
  Modal.open({
    title: '修改应用',
    key: Modal.key(),
    drawer: true,
    style: {
      width: CONSTANTS.MODAL_WIDTH.MAX,
    },
    children: (
      <HostAppConfig
        refresh={refresh}
        detail={data}
      />
    ),
    okText: '修改',
  });
}

export {
  openHostAppConfigModal, openAppConfigModal, openContainerConfigModal, openDeployGroupConfigModal,
};
