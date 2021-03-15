import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Icon } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import NetworkForm from '@/routes/deployment/modals/deploy/NetworkForm';
import DomainForm from '@/routes/deployment/modals/deploy/DomainForm';
import { StoreProvider as DeployStoreProvider } from '../../../deploy/stores';
import { StoreProvider, useDeployStore } from '../../../../stores';

import '../../../deploy/index.less';

const ResourceSetting = observer((
  {
    prefixCls = 'c7ncd-deploy',
    intlPrefix = 'c7ncd.deploy',
    style,
    networkRef,
    domainRef,
    envId,
  },
) => {
  const [resourceIsExpand, setResourceIsExpand] = useState(false);
  const [netIsExpand, setNetIsExpand] = useState(false);
  const [ingressIsExpand, setIngressIsExpand] = useState(false);

  function handleExpand(Operating) {
    Operating((pre) => !pre);
  }

  return (
    <div
      className="c7ncd-deploy-manual-deploy"
      style={style || undefined}
    >
      <div className={`${prefixCls}-resource-config`}>
        <div
          role="none"
          className={`${prefixCls}-resource-config-title`}
          onClick={() => handleExpand(setResourceIsExpand)}
        >
          <FormattedMessage id={`${intlPrefix}.resource`} />
          <Icon
            type={resourceIsExpand ? 'expand_less' : 'expand_more'}
            className={`${prefixCls}-resource-config-icon`}
          />
        </div>
        <div className={resourceIsExpand ? '' : `${prefixCls}-resource-display`}>
          <div
            role="none"
            className={`${prefixCls}-resource-config-network`}
            onClick={() => handleExpand(setNetIsExpand)}
          >
            <Icon
              type={netIsExpand ? 'expand_less' : 'expand_more'}
              className={`${prefixCls}-resource-config-network-icon`}
            />
            <FormattedMessage id={`${intlPrefix}.network`} />
          </div>
          <div className={netIsExpand ? `${prefixCls}-resource-content` : `${prefixCls}-resource-display`}>
            <NetworkForm cRef={networkRef} envId={envId} />
          </div>
          <div
            role="none"
            className={`${prefixCls}-resource-config-network`}
            onClick={() => handleExpand(setIngressIsExpand)}
          >
            <Icon
              type={ingressIsExpand ? 'expand_less' : 'expand_more'}
              className={`${prefixCls}-resource-config-network-icon`}
            />
            <FormattedMessage id={`${intlPrefix}.ingress`} />
          </div>
          <div className={ingressIsExpand ? `${prefixCls}-resource-content` : `${prefixCls}-resource-display`}>
            <DomainForm envId={envId} cRef={domainRef} />
          </div>
        </div>
      </div>
    </div>
  );
});

const Content = observer(() => {
  const {
    deployStore,
    style,
    networkRef,
    domainRef,
    envId,
  } = useDeployStore();

  return (
    <DeployStoreProvider deployStore={deployStore}>
      <ResourceSetting style={style} networkRef={networkRef} domainRef={domainRef} envId={envId} />
    </DeployStoreProvider>
  );
});

export default observer((props) => (
  <StoreProvider {...props}>
    <Content />
  </StoreProvider>
));
