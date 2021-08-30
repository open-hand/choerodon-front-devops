import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { StoreProvider } from './stores';
import Content from './content';
import AppConfig from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-config';

const DeployGroupConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

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

export { openDeployGroupConfigModal };

export default DeployGroupConfig;
