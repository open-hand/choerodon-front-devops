import React from 'react';
import { Modal, message } from 'choerodon-ui/pro';
import { NetWorkStoreProvider } from './stores';
import Content from './Content';

// 创建网络和修改网络的modal

const errorText = 'appServiceId is required, please check the data from the backend.';

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
  name:string;
  code:string;
}

export const openNetWorkFormModal = (props:NetWorkFormProps) => {
  const isModify = props.networkId;
  if (!props?.appServiceId) {
    message.error(errorText);
    throw new Error(errorText);
  }
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
