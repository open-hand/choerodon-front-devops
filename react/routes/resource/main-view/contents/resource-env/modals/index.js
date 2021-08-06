import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import EnvDetail from '../../../../../../components/env-detail';
import { useResourceStore } from '../../../../stores';
import { useREStore } from '../stores';

const REModals = observer(() => {
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);
  const {
    intlPrefix,
    prefixCls,
    intl: { formatMessage },
    treeDs,
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
  } = useREStore();

  function refresh() {
    baseInfoDs.query();
    resourceCountDs.query();
    treeDs.query();
    gitopsSyncDs.query();
    gitopsLogDs.query();
  }

  function linkToConfig() {
    const record = baseInfoDs.current;
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
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      children: <EnvDetail record={baseInfoDs.current} />,
      drawer: true,
      style: modalStyle,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
  }

  function getButtons() {
    return [{
      name: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      icon: 'find_in_page-o',
      handler: openEnvDetail,
      display: true,
    }, {
      name: formatMessage({ id: `${intlPrefix}.environment.config-lab` }),
      icon: 'account_balance',
      handler: linkToConfig,
      display: true,
    }, {
      permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.autoDeploy'],
      icon: autoDeployStatus ? 'block' : 'finished',
      disabled: !existAutoDeploy,
      tooltipsConfig: {
        title: !existAutoDeploy && '流水线中没有该环境下的自动部署任务',
      },
      name: autoDeployStatus ? '停用自动部署' : '开启自动部署',
      handler: handleCloseAutoDeployModal,
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
    }];
  }

  return <HeaderButtons items={getButtons()} showClassName />;
});

export default REModals;
