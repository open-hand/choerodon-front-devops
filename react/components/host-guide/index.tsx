import React from 'react';
import {
  Modal,
} from 'choerodon-ui/pro';
import {
  CONSTANTS,
} from '@choerodon/master';
import Content from './content';

const {
  MODAL_WIDTH: {
    MIDDLE,
  },
} = CONSTANTS;

const Index = () => (
  <Content />
);

const handleModal = () => {
  Modal.open({
    key: Modal.key(),
    title: '主机部署指引',
    drawer: true,
    style: {
      width: MIDDLE,
    },
    okCancel: false,
    okText: '关闭',
    children: (
      <Index />
    ),
  });
};

export {
  handleModal,
};
