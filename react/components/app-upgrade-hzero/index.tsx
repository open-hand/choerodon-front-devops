import React from 'react';
import { StoreProvider } from './stores';
import Content from './Content';
import './index.less';
import { openHzeroUpgradeModal } from '@/components/app-upgrade/index';

type AppUpgradeHzeroIndex = {
}

const AppUpgradeHzeroIndex = (props: AppUpgradeHzeroIndex) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);

export default AppUpgradeHzeroIndex;

export {
  openHzeroUpgradeModal,
};
