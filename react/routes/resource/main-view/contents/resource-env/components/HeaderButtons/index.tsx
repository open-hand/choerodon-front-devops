import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import { NewTips } from '@choerodon/components';
import EnvDetail from '../../../../../../../components/env-detail';
import DeployConfigForm from '../../../../../../../components/deploy-config-form';
import { useResourceStore } from '../../../../../stores';
import { useREStore } from '../../stores';
import PermissionPage from './components/permission';

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

  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    treeDs,
    resourceStore: { getSelectedMenu: { id } },
  } = useResourceStore();

  const {
    baseInfoDs,
    resourceCountDs,
    gitopsLogDs,
    gitopsSyncDs,
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
  } = useREStore();

  const record = baseInfoDs.current;

  function refresh() {
    baseInfoDs.query();
    resourceCountDs.query();
    treeDs.query();
    gitopsSyncDs.query();
    gitopsLogDs.query();
  }

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
      okText: formatMessage({ id: 'create' }),
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

  function getButtons() {
    return [
      {
        name: '创建应用',
        icon: 'playlist_add',
        handler: () => {},
      },
      {
        permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.deploy-config'],
        disabled: !record,
        name: formatMessage({ id: `${intlPrefix}.create.config` }),
        icon: 'playlist_add',
        handler: openConfigModal,
      },
      // 权限管理
      {
        permissions: ['choerodon.code.project.deploy.app-deployment.resource.ps.permission'],
        name: formatMessage({ id: `${intlPrefix}.modal.permission` }),
        icon: 'settings-o',
        handler: openPermission,
        disabled: !record,
      },
      {
        name: '更多操作',
        groupBtnItems: [
          {
            name: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
            handler: openEnvDetail,
          },
          {
            name: formatMessage({ id: `${intlPrefix}.environment.config-lab` }),
            handler: linkToConfig,
          },
          {
            permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.autoDeploy'],
            disabled: !existAutoDeploy,
            tooltipsConfig: {
              title: !existAutoDeploy && '流水线中没有该环境下的自动部署任务',
            },
            name: autoDeployStatus ? '停用自动部署' : '开启自动部署',
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
