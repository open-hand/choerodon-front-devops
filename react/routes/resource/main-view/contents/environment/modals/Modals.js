import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { HeaderButtons } from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';
import EnvDetail from '../../../../../../components/env-detail';
import LinkService from '../../../../../app-center/app-list/components/link-service';
import PermissionPage from './permission';
import { useResourceStore } from '../../../../stores';
import { useEnvironmentStore } from '../stores';
import { useModalStore } from './stores';
import Tips from '../../../../../../components/new-tips';
import DeployConfigForm from '../../../../../../components/deploy-config-form';
import Deploy from '../../../../../deployment/modals/deploy';
import BatchDeploy from '../../../../../deployment/modals/batch-deploy';

import '../../../../../../components/dynamic-select/style/index.less';
import { SMALL } from '../../../../../../utils/getModalWidth';

const modalKey1 = Modal.key();
const modalKey2 = Modal.key();
const modalKey3 = Modal.key();
const configKey = Modal.key();
const deployKey = Modal.key();
const batchDeployKey = Modal.key();

const EnvModals = observer(() => {
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);
  const configModalStyle = useMemo(() => ({
    width: 'calc(100vw - 3.52rem)',
    minWidth: '2rem',
  }), []);
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    resourceStore: { getSelectedMenu: { id } },
    AppState: { currentMenuType: { id: projectId } },
    treeDs,
    resourceStore,
    itemTypes,
  } = useResourceStore();
  const intlPrefixDeploy = 'c7ncd.deploy';
  const {
    envStore,
    tabs: {
      SYNC_TAB,
      ASSIGN_TAB,
      CONFIG_TAB,
      POLARIS_TAB,
    },
    permissionsDs,
    gitopsLogDs,
    gitopsSyncDs,
    baseInfoDs,
    configFormDs,
    configDs,
    polarisNumDS,
    istSummaryDs,
  } = useEnvironmentStore();

  const ModalStores = useModalStore();

  const {
    modalStore,
    nonePermissionDs,
    deployStore,
  } = ModalStores;

  function linkServices(data) {
    return modalStore.addService(projectId, id, data);
  }

  function refresh() {
    baseInfoDs.query();
    treeDs.query();
    const tabKey = envStore.getTabKey;
    switch (tabKey) {
      case SYNC_TAB:
        gitopsSyncDs.query();
        gitopsLogDs.query();
        break;
      case ASSIGN_TAB:
        permissionsDs.query();
        break;
      case CONFIG_TAB:
        configDs.query();
        break;
      case POLARIS_TAB:
        loadPolaris();
        break;
      default:
        break;
    }
  }

  async function loadPolaris() {
    const res = await envStore.checkHasInstance(projectId, id);
    if (res) {
      polarisNumDS.query();
      istSummaryDs.query();
    }
  }

  function deployAfter({ envId, appServiceId, id: instanceId }) {
    treeDs.query();
    const parentId = `${envId}**${appServiceId}`;
    resourceStore.setSelectedMenu({
      id: instanceId,
      parentId,
      key: `${parentId}**${instanceId}`,
      itemType: itemTypes.IST_ITEM,
    });
    resourceStore.setExpandedKeys([`${envId}`, `${envId}**${appServiceId}`]);
  }

  function openEnvDetail() {
    const record = baseInfoDs.current;
    const data = record ? {
      ...record.toData(),
      synchronize: true,
    } : null;
    Modal.open({
      key: modalKey1,
      title: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      children: <EnvDetail record={data} isRecord={false} />,
      drawer: true,
      style: modalStyle,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
  }

  const openLinkService = useCallback(() => {
    Modal.open({
      key: modalKey2,
      title: <Tips
        helpText={formatMessage({ id: `${intlPrefix}.service.tips` })}
        title={formatMessage({ id: `${intlPrefix}.modal.service.link` })}
      />,
      style: { width: SMALL },
      drawer: true,
      className: 'c7ncd-modal-wrapper',
      children: <LinkService
        refresh={() => treeDs.query()}
        envId={id}
      />,
    });
  }, [id]);

  function openPermission() {
    const modalPorps = {
      dataSet: permissionsDs,
      nonePermissionDs,
      formatMessage,
      store: modalStore,
      baseDs: baseInfoDs,
      intlPrefix,
      prefixCls,
      refresh,
      projectId,
    };
    Modal.open({
      key: modalKey3,
      title: <Tips
        helpText={formatMessage({ id: `${intlPrefix}.permission.tips` })}
        title={formatMessage({ id: `${intlPrefix}.modal.permission` })}
      />,
      drawer: true,
      style: modalStyle,
      className: 'c7ncd-modal-wrapper',
      children: <PermissionPage
        {...modalPorps}
      />,
    });
  }

  function toPermissionTab() {
    const { getTabKey } = envStore;
    baseInfoDs.query();
    envStore.setTabKey(ASSIGN_TAB);
    getTabKey === ASSIGN_TAB && permissionsDs.query();
  }

  function linkToConfig() {
    const record = baseInfoDs.current;
    const url = record && record.get('gitlabUrl');
    url && window.open(url);
  }

  function openConfigModal() {
    Modal.open({
      key: configKey,
      title: formatMessage({ id: `${intlPrefix}.create.config` }),
      children: <DeployConfigForm
        refresh={refresh}
        envId={id}
      />,
      drawer: true,
      style: configModalStyle,
      okText: formatMessage({ id: 'create' }),
    });
  }

  function openDeploy() {
    Modal.open({
      key: deployKey,
      style: configModalStyle,
      drawer: true,
      title: formatMessage({ id: `${intlPrefixDeploy}.manual` }),
      children: <Deploy
        deployStore={deployStore}
        refresh={deployAfter}
        intlPrefix={intlPrefixDeploy}
        prefixCls="c7ncd-deploy"
        envId={id}
      />,
      afterClose: () => {
        deployStore.setCertificates([]);
        deployStore.setAppService([]);
        deployStore.setConfigValue('');
      },
      okText: formatMessage({ id: 'deployment' }),
    });
  }

  function openBatchDeploy() {
    Modal.open({
      key: batchDeployKey,
      style: configModalStyle,
      drawer: true,
      title: formatMessage({ id: `${intlPrefixDeploy}.batch` }),
      children: <BatchDeploy
        deployStore={deployStore}
        refresh={deployAfter}
        intlPrefix={intlPrefixDeploy}
        prefixCls="c7ncd-deploy"
        envId={id}
      />,
      afterClose: () => {
        deployStore.setCertificates([]);
        deployStore.setAppService([]);
        deployStore.setShareAppService([]);
        deployStore.setConfigValue('');
      },
      okText: formatMessage({ id: 'deployment' }),
    });
  }

  function getButtons() {
    const record = baseInfoDs.current;
    const notReady = !record;
    const connect = record && record.get('connect');
    const configDisabled = !connect || notReady;
    return [{
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.link'],
      name: formatMessage({ id: `${intlPrefix}.modal.service.link` }),
      icon: 'relate',
      handler: openLinkService,
      display: true,
      disabled: notReady,
    }, {
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.deploy-config'],
      disabled: notReady,
      name: formatMessage({ id: `${intlPrefix}.create.config` }),
      icon: 'playlist_add',
      handler: openConfigModal,
      display: true,
    }, {
      name: '部署',
      icon: 'cloud_done-o',
      groupBtnItems: [
        {
          permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.manual'],
          disabled: configDisabled,
          name: formatMessage({ id: `${intlPrefixDeploy}.manual` }),
          handler: openDeploy,
        }, {
          permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.batch'],
          disabled: configDisabled,
          name: formatMessage({ id: `${intlPrefixDeploy}.batch` }),
          handler: openBatchDeploy,
        },
      ],
    }, {
      permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.permission'],
      name: formatMessage({ id: `${intlPrefix}.modal.permission` }),
      icon: 'settings-o',
      handler: openPermission,
      display: true,
      disabled: notReady,
    }, {
      disabled: notReady,
      name: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      icon: 'find_in_page-o',
      handler: openEnvDetail,
      display: true,
    }, {
      disabled: notReady,
      name: formatMessage({ id: `${intlPrefix}.environment.config-lab` }),
      icon: 'account_balance',
      handler: linkToConfig,
      display: true,
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
    }];
  }

  return <HeaderButtons items={getButtons()} showClassName />;
});

export default EnvModals;
