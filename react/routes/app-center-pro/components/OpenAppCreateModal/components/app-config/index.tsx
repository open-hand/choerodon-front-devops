import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { StoreProvider } from './stores';
import Content from './content';

const AppConfig = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default AppConfig;

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

export { openAppConfigModal };
