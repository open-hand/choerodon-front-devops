import React from 'react';
import { useAppInfoStore } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/app-info/stores';

const Index = () => {
  const {
    AppInfoDataSet,
  } = useAppInfoStore();

  console.log(AppInfoDataSet);

  return (
    <div>
      123
    </div>
  );
};

export default Index;
