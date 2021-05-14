import React, {
  useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import Detail from './secret-detail';
import { useResourceStore } from '../../../../stores';
import { useModalStore } from './stores';
import { useSecretDetailStore } from '../stores';

const modalStyle = {
  width: 380,
};

const modalKey1 = Modal.key();

const CustomModals = observer(() => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    treeDs,
  } = useResourceStore();
  const {
    detailDs,
  } = useSecretDetailStore();
  const {
    permissions,
  } = useModalStore();

  function refresh() {
    treeDs.query();
    detailDs.query();
  }

  function openDetail() {
    Modal.open({
      key: modalKey1,
      title: formatMessage({ id: `${intlPrefix}.secret.detail` }),
      children: <Detail
        record={detailDs.current}
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

  const buttons = useMemo(() => ([{
    name: formatMessage({ id: `${intlPrefix}.secret.detail` }),
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

export default CustomModals;
