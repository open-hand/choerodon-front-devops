import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { StoreProvider } from './stores';
import Content from './content';

const Index = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

const handleBuildModal = () => {
  Modal.open({
    title: '添加【构建】阶段',
    drawer: true,
    children: <Index />,
    style: {
      width: CONSTANTS.MODAL_WIDTH.MAX,
    },
    key: Modal.key(),
    footer: null,
  });
};

export default Index;

export {
  handleBuildModal,
};
