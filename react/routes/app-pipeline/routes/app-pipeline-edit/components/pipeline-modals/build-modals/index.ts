import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';

const Index = () => (
  123
);

const handleBuildModal = () => {
  Modal.open({
    title: '添加【构建】阶段',
    drawer: true,
    children: Index,
    style: {
      width: CONSTANTS.MODAL_WIDTH.MAX,
    },
    key: Modal.key(),
  });
};

export default Index;

export {
  handleBuildModal,
};
