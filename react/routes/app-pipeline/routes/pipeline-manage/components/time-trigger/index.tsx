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
    MIDDLE,
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
    title: '定时触发配置',
    drawer: true,
    style: {
      width: MIDDLE,
    },
    children: (
      <Index />
    ),
  });
};

export {
  handleModal,
};
