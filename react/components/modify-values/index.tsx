import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { StoreProvider } from './stores';
import FormContent from './Content';

function Modify(props:any) {
  return (
    <StoreProvider {...props}>
      <FormContent />
    </StoreProvider>
  );
}

const valuesKey = Modal.key();

type openModifyValueModalProps ={
  appServiceVersionId: string |number,
  appServiceId: string |number,
  isMarket: boolean,
  isMiddleware:boolean,
  instanceId:string,
  envId:string,
  afterDeploy?:(...args:any[])=>any
}

// 修改Values弹窗打开
export function openModifyValueModal({
  appServiceVersionId,
  appServiceId,
  isMarket,
  isMiddleware,
  instanceId,
  envId,
  afterDeploy,
}:openModifyValueModalProps) {
  Modal.open({
    key: valuesKey,
    title: '修改Values',
    drawer: true,
    okText: '部署',
    style: {
      width: 'calc(100vw - 3.52rem)',
    },
    children: <Modify
      instanceId={instanceId}
      envId={envId}
      refresh={afterDeploy}
      isMarket={isMarket}
      isMiddleware={isMiddleware}
      appServiceVersionId={appServiceVersionId}
      appServiceId={appServiceId}
    />,
  });
}

export default Modify;
