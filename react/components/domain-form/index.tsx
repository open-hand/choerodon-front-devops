import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { StoreProvider } from './stores';
import Content from './Content';

const DomainForm = (props:any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

const modalKey = Modal.key();

type DomainModalProps = {
  envId:string,
  appServiceId:string,
  ingressId?:string
  refresh?:(...args:any[])=>any,
  saveNetworkIds?:(ids:any[])=>any
}

export const openDomainFormModal = (props:DomainModalProps) => {
  const isModify = props.ingressId;
  Modal.open({
    key: modalKey,
    drawer: true,
    title: isModify ? '修改域名' : '创建域名',
    children: <DomainForm {...props} />,
    okText: isModify ? '修改' : '创建',
    style: {
      width: 740,
    },
  });
};

export default DomainForm;
