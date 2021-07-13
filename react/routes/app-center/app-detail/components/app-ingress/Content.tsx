/* eslint-disable max-len */
import React, { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/boot';
import AppIngressTable from '@/components/app-ingress-table';
import { Modal, Table } from 'choerodon-ui/pro';
import { TableQueryBarType } from '@/interface';
import { HeaderButtons } from '@choerodon/master';
import { useAppIngressStore } from './stores';

import './index.less';

const modalKey = Modal.key();
const modalStyle = {
  width: 'calc(100vw - 3.52rem)',
};

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
