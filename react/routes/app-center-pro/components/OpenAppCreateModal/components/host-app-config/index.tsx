import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { StoreProvider } from './stores';
import Content from './content';

const HostAppConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default HostAppConfig;

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

export { openHostAppConfigModal };
