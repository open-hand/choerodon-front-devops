import React, {
  Fragment, useMemo, useCallback, useEffect, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { Button } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { HeaderButtons } from '@choerodon/master';
import { useResourceStore } from '../../../../stores';
import { useModalStore } from './stores';
import { useCustomDetailStore } from '../stores';
import Detail from './ingress-detail';

const modalStyle = {
  width: '26%',
};
const modalKey1 = Modal.key();

const CustomModals = observer(() => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    resourceStore,
    treeDs,
  } = useResourceStore();
  const {
    detailDs,
  } = useCustomDetailStore();
  const {
    permissions,
    AppState: { currentMenuType: { projectId } },
  } = useModalStore();
  const { parentId } = resourceStore.getSelectedMenu;

  function refresh() {
    treeDs.query();
    detailDs.query();
  }

  function openDetail() {
    const detailModal = Modal.open({
      key: modalKey1,
      title: formatMessage({ id: `${intlPrefix}.ingress.detail` }),
      children: <Detail
        record={detailDs.current}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        formatMessage={formatMessage}
      />,
      drawer: true,
      style: modalStyle,
      footer: (
        <Button funcType="raised" type="primary" onClick={() => detailModal.close()}>
          <FormattedMessage id="close" />
        </Button>
      ),
    });
  }

  const buttons = useMemo(() => ([{
    name: formatMessage({ id: `${intlPrefix}.ingress.detail` }),
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
