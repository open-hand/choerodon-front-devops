import React from 'react';
import {
  Modal,
} from 'choerodon-ui/pro';
import {
  CONSTANTS,
} from '@choerodon/master';
import { StoreProvider } from './stores';
import Content from './content';

const {
  MODAL_WIDTH: {
    MIN,
  },
} = CONSTANTS;

const Index = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

const handleModal = () => {
  Modal.open({
    key: Modal.key(),
    title: '添加定时触发计划',
    drawer: true,
    style: {
      width: MIN,
    },
    children: (
      <Index />
    ),
  });
};

export {
  handleModal,
};
