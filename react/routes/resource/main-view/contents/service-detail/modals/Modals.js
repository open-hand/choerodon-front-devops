import React, { useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import { useResourceStore } from '../../../../stores';
import { useModalStore } from './stores';
import { useNetworkDetailStore } from '../stores';
import Detail from './network-detail';

const modalKey1 = Modal.key();
const modalStyle = {
  width: 380,
};

const ServiceModals = observer(() => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    resourceStore,
    treeDs,
  } = useResourceStore();
  const {
    baseInfoDs,
  } = useNetworkDetailStore();
  const {
    permissions,
    AppState: { currentMenuType: { projectId } },
  } = useModalStore();

  function openDetail() {
    Modal.open({
      key: modalKey1,
      title: formatMessage({ id: `${intlPrefix}.net.detail` }),
      children: <Detail
        record={baseInfoDs.current}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        formatMessage={formatMessage}
      />,
      drawer: true,
      style: modalStyle,
      okText: formatMessage({ id: 'close' }),
      okCancel: false,
    });
  }

  function refresh() {
    treeDs.query();
    baseInfoDs.query();
  }

  const buttons = useMemo(() => ([{
    name: formatMessage({ id: `${intlPrefix}.net.detail` }),
    icon: 'find_in_page',
    handler: openDetail,
    display: true,
    service: permissions,
  }, {
    icon: 'refresh',
    handler: refresh,
    display: true,
  }]), [formatMessage, intlPrefix, permissions, refresh]);

  return <HeaderButtons items={buttons} showClassName />;
});

export default ServiceModals;
