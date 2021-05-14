import React, {
  useEffect, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderButtons } from '@choerodon/master';
import { useResourceStore } from '../../../../stores';
import { useModalStore } from './stores';
import { useCertificateStore } from '../stores';
import FormView from './form-view';
import { useMainStore } from '../../../stores';

const EnvModals = observer(() => {
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    resourceStore,
    treeDs,
  } = useResourceStore();
  const {
    certificateDs,
  } = useCertificateStore();
  const { certStore } = useMainStore();
  const {
    permissions,
    AppState: { currentMenuType: { projectId } },
  } = useModalStore();
  const { parentId } = resourceStore.getSelectedMenu;

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    certStore.checkCertManager(projectId, parentId);
  }, [projectId, parentId]);

  function refresh() {
    treeDs.query();
    certificateDs.query();
  }

  function openModal() {
    setShowModal(true);
  }

  function closeModal(isLoad) {
    setShowModal(false);
    isLoad && refresh();
  }

  function getButtons() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord.get('connect');
    const disabled = !connect || !certStore.getHasCertManager;

    return ([{
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.create-certifications'],
      name: formatMessage({ id: `${intlPrefix}.create.certificate` }),
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
      {showModal && (
        <FormView
          visible={showModal}
          store={certStore}
          envId={parentId}
          onClose={closeModal}
        />
      )}
    </>
  );
});

export default EnvModals;
