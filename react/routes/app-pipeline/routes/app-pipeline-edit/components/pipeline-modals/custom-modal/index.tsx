import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { StoreProvider } from './stores';
import Content from './content';

const Index = observer((props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
));

const handleCustomModal = (data: any, handleJobAddCallback: any, title?: any) => {
  Modal.open({
    title: title || '添加【自定义】任务',
    drawer: true,
    children: <Index data={data} handleJobAddCallback={handleJobAddCallback} />,
    style: {
      width: CONSTANTS.MODAL_WIDTH.MIDDLE,
    },
    key: Modal.key(),
    footer: null,
    maskClosable: false,
  });
};

export default Index;

export {
  handleCustomModal,
};
