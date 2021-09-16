/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import { useResourceStore } from '../../../../stores';
import { useModalStore } from './stores';
import { SMALL } from '@/utils/getModalWidth';
import { useNetworkStore } from '../stores';
import { useMainStore } from '../../../stores';
import CreateNetwork from './network-operation';

const modalKey = Modal.key();
const modalStyle = {
  width: SMALL,
};

const EnvModals = observer(() => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    resourceStore,
    treeDs,
  } = useResourceStore();
  const {
    networkDs,
  } = useNetworkStore();
  const {
    networkStore,
  } = useMainStore();
  const {
    permissions,
    AppState: { currentMenuType: { projectId } },
  } = useModalStore();
  const { parentId } = resourceStore.getSelectedMenu;

  function refresh() {
    treeDs.query();
    networkDs.query();
  }

  function openModal() {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: formatMessage({ id: 'network.header.create' }),
      children: <CreateNetwork
        envId={parentId}
        store={networkStore}
        refresh={refresh}
      />,
      okText: formatMessage({ id: 'create' }),
    });
  }

  function getButtons() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord.get('connect');
    const disabled = !connect;

    return ([{
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.network'],
      name: formatMessage({ id: `${intlPrefix}.create.network` }),
      icon: 'playlist_add',
      handler: openModal,
      display: true,
      service: permissions,
      disabled,
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
    }]);
  }

  return <HeaderButtons items={getButtons()} showClassName />;
});

export default EnvModals;
