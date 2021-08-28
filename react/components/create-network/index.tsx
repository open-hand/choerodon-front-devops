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
  const isModify = props.networkId;
  Modal.open({
    key: modalKey,
    drawer: true,
    title: isModify ? '修改网络' : '创建网络',
    children: <NetWorkForm {...props} />,
    style: {
      width: 740,
    },
    okText: isModify ? '修改' : '创建',
  });
};

export default NetWorkForm;
