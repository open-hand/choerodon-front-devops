import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import ManualConnect from './components/manual-connect';
import AutoConnect from './components/auto-connect';
import AllConnect from './components/all-connect';
import { useHostConnectStore } from './stores';

const HostConnect = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    stepKeys: { ALL, AUTO, MANUAL },
    mainStore,
  } = useHostConnectStore();

  const contentDom = useMemo(() => ({
    [ALL]: <AllConnect />,
    [AUTO]: <AutoConnect />,
    [MANUAL]: <ManualConnect />,
  }), []);

  const getContent = useMemo(() => (
    // @ts-ignore
    contentDom[mainStore.getCurrentStep] || null
  ), [mainStore.getCurrentStep]);

  return (
    <div className={`${prefixCls}-wrap`}>
      {getContent}
    </div>
  );
});

export default HostConnect;
