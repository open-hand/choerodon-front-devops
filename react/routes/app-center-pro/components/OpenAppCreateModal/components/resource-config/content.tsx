import React, {
  useImperativeHandle, useRef, useEffect, useState,
} from 'react';
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

  const [netName, setNetName] = useState('');
  const [portsList, setPortsList] = useState([]);

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

  useEffect(() => {
    setNetName((netRef?.current as any)?.getNetName());
  }, [(netRef?.current as any)?.getNetName()]);

  useEffect(() => {
    const data = (netRef?.current as any)?.getPorts();
    if (data && data.length > 0) {
      const mapData = (netRef?.current as any)?.getPorts().map((item: any) => item.port || '');
      if (JSON.stringify(mapData) !== JSON.stringify(portsList)) {
        setPortsList(mapData);
      }
    }
  }, [(netRef?.current as any)?.getPorts()]);

  return (
    <div className="c7ncd-appCenterPro-reConfig">
      <div className="c7ncd-appCenterPro-reConfig__network">
        <NetworkConfig cRef={netRef} envId={envId} />
      </div>
      <div className="c7ncd-appCenterPro-reConfig__ingress">
        <IngressConfig
          netName={netName}
          cRef={ingressRef}
          envId={envId}
          portsList={portsList}
        />
      </div>
    </div>
  );
});

export default Index;
