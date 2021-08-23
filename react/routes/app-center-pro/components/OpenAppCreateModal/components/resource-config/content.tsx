import React from 'react';
import NetworkConfig
  from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/components/network-config';
import { useResourceConfigStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/resource-config/stores';

const Index = () => {
  const {
    envId,
  } = useResourceConfigStore();
  return (
    <div>
      <NetworkConfig envId={envId} />
    </div>
  );
};

export default Index;
