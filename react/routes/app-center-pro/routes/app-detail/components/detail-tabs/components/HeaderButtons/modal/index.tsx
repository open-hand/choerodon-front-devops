import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import ModifyValues from '../components/modify-values';

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
    children: <ModifyValues
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
