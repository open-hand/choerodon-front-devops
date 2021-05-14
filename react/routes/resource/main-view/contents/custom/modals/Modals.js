import React from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import { useResourceStore } from '../../../../stores';
import { useModalStore } from './stores';
import { useCustomStore } from '../stores';
import CustomForm from './form-view/formViewPro';
import { useMainStore } from '../../../stores';

const modalKey = Modal.key();
const modalStyle = {
  width: 'calc(100vw - 3.52rem)',
};

const CustomModals = observer(() => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    resourceStore,
    treeDs,
  } = useResourceStore();
  const {
    customDs,
  } = useCustomStore();
  const { customStore } = useMainStore();
  const {
    permissions,
    AppState: { currentMenuType: { projectId } },
  } = useModalStore();
  const { parentId } = resourceStore.getSelectedMenu;

  function refresh() {
    treeDs.query();
    customDs.query();
  }

  function openModal() {
    Modal.open({
      key: modalKey,
      style: modalStyle,
      drawer: true,
      title: formatMessage({ id: 'resource.create.header' }),
      children: <CustomForm
        envId={parentId}
        type="create"
        store={customStore}
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
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.customize-resource'],
      name: formatMessage({ id: `${intlPrefix}.create.custom` }),
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

  return (
    <>
      <HeaderButtons items={getButtons()} showClassName />
    </>
  );
});

export default CustomModals;
