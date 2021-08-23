import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { NetWorkStoreProvider } from './stores';
import Content from './Content';

const NetWorkForm = (props:any) => (
  <NetWorkStoreProvider {...props}>
    <Content />
  </NetWorkStoreProvider>
);

const modalKey = Modal.key();

type NetWorkFormProps = {
  envId: string,
  appServiceId: string,
  networkId?: string
  refresh?:(...args:any[])=>any;
}

export const openNetWorkFormModal = (props:NetWorkFormProps) => {
  Modal.open({
    key: modalKey,
    drawer: true,
    title: '创建网络',
    children: <NetWorkForm {...props} />,
    style: {
      width: 740,
    },
    okText: '创建',
  });
};

export default NetWorkForm;
