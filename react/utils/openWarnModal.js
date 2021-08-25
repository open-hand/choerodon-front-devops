import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { FormattedMessage } from 'react-intl';

export default function openWarnModal(refresh) {
  Modal.open({
    movable: false,
    closable: false,
    key: Modal.key(),
    title: <FormattedMessage id="data.lost" />,
    children: <FormattedMessage id="data.lost.warn" />,
    okCancel: false,
    onOk: refresh,
  });
}
