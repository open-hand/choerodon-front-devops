import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { StoreProvider } from './stores';
import Content from './Content';

// 批量创建应用

const batchDeployKey = Modal.key();

const configModalStyle = () => ({
  width: 'calc(100vw - 3.52rem)',
  minWidth: '2rem',
});

const BatchDeploy = (props:any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
export default BatchDeploy;

export function openBatchDeploy({
  refresh,
  envId,
}:{
  refresh: (...args:any[])=>any
  envId?:string
}) {
  Modal.open({
    key: batchDeployKey,
    style: configModalStyle(),
    drawer: true,
    title: '批量创建Chart应用',
    children: <BatchDeploy
      refresh={refresh}
      envId={envId}
    />,
    okText: '创建',
  });
}
