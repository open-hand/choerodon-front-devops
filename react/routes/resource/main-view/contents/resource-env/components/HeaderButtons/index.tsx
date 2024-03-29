import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons, useFormatMessage } from '@choerodon/master';
import { NewTips } from '@choerodon/components';
import EnvDetail from '@/components/env-detail';
import DeployConfigForm from '@/components/deploy-config-form';
import { useResourceStore } from '../../../../../stores';
import { useREStore } from '../../stores';
import PermissionPage from './components/permission';
import { openAppCreateModal } from '@/components/open-appCreate';
import { openBatchDeploy } from '@/components/batch-deploy';

const envDetailKey = Modal.key();
const configKey = Modal.key();
const permissionKey = Modal.key();

const REModals = observer(() => {
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);

  const configModalStyle = useMemo(() => ({
    width: 'calc(100vw - 3.52rem)',
    minWidth: '2rem',
  }), []);

  const format = useFormatMessage('c7ncd.resource');

  const {
    intlPrefix,
    intl: { formatMessage },
    resourceStore: {
      getSelectedMenu,
      getSelectedMenu: { id },
      setSelectedMenu,
      setExpandedKeys,
    },
    itemTypes,
    treeDs,
  } = useResourceStore();

  const {
    baseInfoDs,
    mainStore: {
      autoDeployMsg: {
        existAutoDeploy = false,
        autoDeployStatus = false,
      },
      handleAutoDeployStatus,
    },
    key,
    projectId,
    name,
    permissionsDs,
    nonePermissionDs,
    refresh,
  } = useREStore();

  const record = baseInfoDs.current;

  function linkToConfig() {
    const url = record && record.get('gitlabUrl');
    url && window.open(url);
  }

  async function handleCloseAutoDeployModal() {
    Modal.open({
      title: autoDeployStatus ? '停用自动部署' : '启用自动部署',
      onOk: () => handleAutoDeployStatus(key, projectId, refresh),
      children: autoDeployStatus ? `确定要停用环境“${name}”下所有的自动部署任务吗？停用后，所有应用流水线中该环境的自动部署任务将不再执行。需要您在此手动开启后，才会继续生效。` : `是否要启用“${name}”环境的自动部署？`,
      okText: autoDeployStatus ? '停用' : '启用',
    });
  }

  function openEnvDetail() {
    Modal.open({
      key: envDetailKey,
      title: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      children: <EnvDetail record={record} />,
      drawer: true,
      style: modalStyle,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
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
      okText: formatMessage({ id: 'boot.create' }),
    });
  }

  function openPermission() {
    const modalPorps = {
      permissionsDs,
      nonePermissionDs,
      baseDs: baseInfoDs,
      intlPrefix,
      refresh,
      envId: id,
    };
    Modal.open({
      key: permissionKey,
      title: <NewTips
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

  async function handleCreateCallback(type: 'deployGroup' | 'chart', { envId }:any) {
    let menuData = {};
    switch (type) {
      case 'deployGroup':
        menuData = {
          id: 1,
          name: formatMessage({ id: 'workload_group' }),
          key: `${envId}**workload`,
          isGroup: true,
          expand: false,
          itemType: `${itemTypes.WORKLOAD_GROUP}`,
          parentId: String(envId),
        };
        break;
      case 'chart':
        menuData = {
          id: 0,
          name: formatMessage({ id: 'instances' }),
          key: `${envId}**instances`,
          isGroup: true,
          // expand: false,
          itemType: 'group_instances',
          parentId: String(envId),
        };
        break;
      default:
        break;
    }
    await refresh();
    setSelectedMenu(menuData);
    setExpandedKeys([`${envId}`]);
  }

  function getButtons() {
    const notReady = !record;
    const connect = record && record.get('connect');
    const configDisabled = !connect || notReady;
    return [
      {
        name: format({ id: 'CreateApplication' }),
        icon: 'playlist_add',
        disabled: !connect,
        handler: () => openAppCreateModal(handleCreateCallback, true, id),
      },
      {
        permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.deploy-config'],
        disabled: !record,
        name: format({ id: 'CreateDeploymentConfiguration' }),
        icon: 'playlist_add',
        handler: openConfigModal,
      },
      // 权限管理
      {
        permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.permission'],
        name: format({ id: 'AuthorityManagement' }),
        icon: 'settings-o',
        handler: openPermission,
        disabled: !record,
      },
      {
        permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.resource-batch'],
        disabled: configDisabled,
        name: format({ id: 'BatchCreateChartApplication' }),
        icon: 'library_add-o',
        handler: () => openBatchDeploy({
          envId: id,
          refresh,
        }),
      },
      {
        name: format({ id: 'MoreActions' }),
        groupBtnItems: [
          {
            name: format({ id: 'EnvironmentalDetails' }),
            handler: openEnvDetail,
          },
          {
            name: format({ id: 'ConfigurationLibrary' }),
            handler: linkToConfig,
          },
          {
            permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.autoDeploy'],
            disabled: !existAutoDeploy,
            tooltipsConfig: {
              title: !existAutoDeploy && '流水线中没有该环境下的自动部署任务',
            },
            name: format({ id: autoDeployStatus || !existAutoDeploy ? 'DisableAutomaticDeployment' : 'EnablingAutomaticDeployment' }),
            handler: handleCloseAutoDeployModal,
          },
        ],
      },
      {
        icon: 'refresh',
        handler: refresh,
      }];
  }

  return <HeaderButtons items={getButtons()} showClassName />;
});

export default REModals;
