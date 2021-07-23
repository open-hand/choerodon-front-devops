/* eslint-disable max-len */
import React from 'react';
import { observer } from 'mobx-react-lite';
import AppIngressTable from '@/components/app-ingress-table';
import { HeaderButtons } from '@choerodon/master';
import { useAppIngressStore } from './stores';

import './index.less';

const AppIngress = observer(() => {
  const {
    prefixCls,
    appIngressDs,
  } = useAppIngressStore();

  function handleRefresh() {
    appIngressDs.query();
  }

  const renderBtnsItems = () => [
    {
      icon: 'refresh',
      handler: handleRefresh,
      display: true,
    },
  ];

  return (
    <>
      <HeaderButtons
        className={`${prefixCls}-detail-headerButton`}
        items={renderBtnsItems()}
        showClassName
      />
      <AppIngressTable appIngressDataset={appIngressDs} />
    </>
  );
});

export default AppIngress;
