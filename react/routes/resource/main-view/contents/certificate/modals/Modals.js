import React, {
  useEffect, useState,
} from 'react';
import { Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { HeaderButtons, useFormatMessage } from '@choerodon/master';
import { FormattedMessage } from 'react-intl';
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

  const format = useFormatMessage('c7ncd.resource');

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
    Modal.open({
      title: <FormattedMessage id="ctf.sidebar.create" />,
      key: Modal.key(),
      style: {
        width: 380,
      },
      drawer: true,
      okText: <FormattedMessage id="create" />,
      cancelText: <FormattedMessage id="cancel" />,
      children: (
        <FormView
          pro
          visible={showModal}
          store={certStore}
          envId={parentId}
          onClose={closeModal}
        />
      ),
    });
  }

  function closeModal(isLoad) {
    setShowModal(false);
    isLoad && refresh();
  }

  function getButtons() {
    const envRecord = treeDs.find((record) => record.get('key') === parentId);
    const connect = envRecord.get('connect');
    const disabled = !connect || !certStore.getHasCertManager;

    let tooltipsConfig = {};
    if (disabled) {
      tooltipsConfig = {
        title: '环境所在集群未安装certmanager，无法创建证书',
      };
    }

    return ([{
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.create-certifications'],
      name: format({ id: 'CreateCertificate' }),
      icon: 'playlist_add',
      handler: openModal,
      display: true,
      service: permissions,
      disabled,
      tooltipsConfig,
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
    }]);
  }

  return (
    <>
      <HeaderButtons items={getButtons()} showClassName />
      {/* {showModal && ( */}
      {/*  <FormView */}
      {/*    visible={showModal} */}
      {/*    store={certStore} */}
      {/*    envId={parentId} */}
      {/*    onClose={closeModal} */}
      {/*  /> */}
      {/* )} */}
    </>
  );
});

export default EnvModals;
