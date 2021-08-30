import React from 'react';
import { CONSTANTS } from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';
import { StoreProvider } from './stores';
import Content from './content';

const ContainerConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

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

export { openContainerConfigModal };

export default ContainerConfig;
