import React, { useImperativeHandle, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import NetworkConfig
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/network-config';
import { useResourceConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/stores';
import IngressConfig
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/ingress-config';

import './index.less';

const Index = observer(() => {
  const {
    envId,
    cRef,
  } = useResourceConfigStore();

  const netRef = useRef();
  const ingressRef = useRef();

  useImperativeHandle(cRef, () => ({
    handleOk: async () => {
      const netFlag = await (netRef?.current as any)?.handleOk();
      const ingressFlag = await (ingressRef?.current as any)?.handleOk();
      if (netFlag !== false && ingressFlag !== false) {
        return ({
          devopsServiceReqVO: netFlag,
          devopsIngressVO: ingressFlag,
        });
      }
      return false;
    },
  }));

  return (
    <div className="c7ncd-appCenterPro-reConfig">
      <div className="c7ncd-appCenterPro-reConfig__network">
        <NetworkConfig cRef={netRef} envId={envId} />
      </div>
      <div className="c7ncd-appCenterPro-reConfig__ingress">
        <IngressConfig cRef={ingressRef} envId={envId} />
      </div>
    </div>
  );
});

export default Index;
