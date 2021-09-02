import React from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import KeyValueModal from '@/components/key-value';
import { useResourceStore } from '../../../../stores';
import { useModalStore } from './stores';
import { useKeyValueStore } from '../stores';

const modalKey = Modal.key();
const modalStyle = {
  width: 'calc(100vw - 3.52rem)',
};

const KeyValueModals = observer(() => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    resourceStore,
    treeDs,
  } = useResourceStore();
  const {
    formStore,
    SecretTableDs,
  } = useKeyValueStore();
  const {
    permissions,
    AppState: { currentMenuType: { projectId } },
  } = useModalStore();
  const { parentId } = resourceStore.getSelectedMenu;

  function refresh() {
    treeDs.query();
    SecretTableDs.query();
  }

  function openModal() {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.cipher.create` }),
      children: <KeyValueModal
        title="cipher"
        envId={parentId}
        type="secret"
        intlPrefix={intlPrefix}
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
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.cipher'],
      name: formatMessage({ id: `${intlPrefix}.create.cipher` }),
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

export default KeyValueModals;
