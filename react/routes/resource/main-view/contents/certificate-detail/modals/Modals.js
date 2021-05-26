import React, {
  useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import { useResourceStore } from '../../../../stores';
import { useModalStore } from './stores';
import { useCertDetailStore } from '../stores';
import Detail from './certificate-detail';

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
  } = useCertDetailStore();
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
      title: formatMessage({ id: 'ctf.detail' }),
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
    name: formatMessage({ id: 'ctf.detail' }),
    icon: 'find_in_page-o',
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
