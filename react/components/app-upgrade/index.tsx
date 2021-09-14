import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'choerodon-ui/pro';
import { StoreProvider } from './stores';
import Content from './Content';
import HzeroContent from './HzeroContent';

import './index.less';

const marketUpgradeKey = Modal.key();
const HzeroUpgradeKey = Modal.key();

const MarketUpgradeModalContent = (props: any) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
);
const HzeroUpgradeModalContent = (props: any) => (
  <StoreProvider {...props}>
    <HzeroContent />
  </StoreProvider>
);

export default MarketUpgradeModalContent;

type MarketUpgradeModalProps = {
  envId:string,
  appServiceId:string,
  appServiceVersionId:string,
  instanceId:string,
  appServiceName:string
  callback:CallableFunction
  isMiddleware?:boolean,
  isHzero?:boolean
}

// market
function openMarketUpgradeModal({
  appServiceId,
  appServiceVersionId,
  appServiceName,
  envId,
  instanceId,
  callback,
  isMiddleware,
  isHzero,
}:MarketUpgradeModalProps) {
  const defaultData = {
    instanceId,
    marketAppServiceId: appServiceId,
    marketDeployObjectId: appServiceVersionId,
    marketServiceName: appServiceName,
    environmentId: envId,
  };

  Modal.open({
    key: marketUpgradeKey,
    title: <FormattedMessage id="c7ncd.deployment.modal.upgrade.market" />,
    drawer: true,
    okText: <FormattedMessage id="upgrade" />,
    style: {
      width: 'calc(100vw - 3.52rem)',
    },
    children: <MarketUpgradeModalContent
      defaultData={defaultData}
      refresh={callback}
      isHzero={isHzero}
      isMiddleware={isMiddleware}
    />,
  });
}

// Hzero
function openHzeroUpgradeModal({
  appServiceId,
  appServiceVersionId,
  appServiceName,
  envId,
  instanceId,
  callback,
  isMiddleware,
  isHzero,
}:MarketUpgradeModalProps) {
  const defaultData = {
    instanceId,
    marketAppServiceId: appServiceId,
    marketDeployObjectId: appServiceVersionId,
    marketServiceName: appServiceName,
    environmentId: envId,
  };

  Modal.open({
    key: HzeroUpgradeKey,
    title: `升级${appServiceName}`,
    drawer: true,
    okText: <FormattedMessage id="upgrade" />,
    style: {
      width: 'calc(100vw - 3.52rem)',
    },
    children: <HzeroUpgradeModalContent
      defaultData={defaultData}
      refresh={callback}
      isHzero={isHzero}
      isMiddleware={isMiddleware}
    />,
  });
}
export {
  openMarketUpgradeModal,
  openHzeroUpgradeModal,
};
