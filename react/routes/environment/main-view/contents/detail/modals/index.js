import React, {
  useMemo, useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'choerodon-ui/pro';
import { HeaderButtons } from '@choerodon/master';
import EnvDetail from '../../../../../../components/env-detail';
import Permission from '../../../../../resource/main-view/contents/environment/modals/permission';
import { useEnvironmentStore } from '../../../../stores';
import { useMainStore } from '../../../stores';
import { useDetailStore } from '../stores';
import useStore from './useStore';
import EnvCreateForm from '../../../modals/env-create';
import GroupForm from '../../../modals/GroupForm';
import DeployConfigForm from '../../../../../../components/deploy-config-form';
import { isNotRunning } from '../../../../util';
import Tips from '../../../../../../components/new-tips';
import '../../../../../../components/dynamic-select/style/index.less';
import { LARGE } from '../../../../../../utils/getModalWidth';

const detailKey = Modal.key();
const envKey = Modal.key();
const groupKey = Modal.key();
const permissionKey = Modal.key();
// const resourceKey = Modal.key();
const configKey = Modal.key();
// const ITEM_GROUP = 'group';
// const ITEM_SAFETY = 'safety';

const EnvModals = observer(() => {
  const modalStore = useStore();
  const modalStyle = useMemo(() => ({
    width: 380,
  }), []);
  // const actionStyle = useMemo(() => ({
  //   marginLeft: '.2rem',
  // }), []);
  // const configModalStyle = useMemo(() => ({
  //   width: 'calc(100vw - 3.52rem)',
  //   minWidth: '2rem',
  // }), []);
  const {
    treeDs,
    intlPrefix: currentIntlPrefix,
    // prefixCls: currentPrefixCls,
    envStore: { getSelectedMenu },
    AppState: { currentMenuType: { id: projectId } },
  } = useEnvironmentStore();
  const { groupFormDs, createEnvBtnDisable, getCreateEnvDisable } = useMainStore();
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    detailStore,
    tabs: {
      SYNC_TAB,
      CONFIG_TAB,
      ASSIGN_TAB,
    },
    permissionsDs,
    gitopsLogDs,
    gitopsSyncDs,
    configDs,
    // configFormDs,
    checkEnvExist,
    baseDs,
    nonePermissionDs,
  } = useDetailStore();

  useEffect(() => {
    getCreateEnvDisable();
  }, []);

  const refresh = () => {
    checkEnvExist().then((query) => {
      if (query) {
        const { getTabKey } = detailStore;
        switch (getTabKey) {
          case SYNC_TAB: {
            gitopsSyncDs.query();
            gitopsLogDs.query();
            break;
          }
          case CONFIG_TAB:
            configDs.query();
            break;
          case ASSIGN_TAB:
            permissionsDs.query();
            break;
          default:
        }
        treeDs.query();
        baseDs.query();
      }
    });
    getCreateEnvDisable();
  };
  const disabled = isNotRunning(getSelectedMenu || {});

  function openEnvModal() {
    Modal.open({
      key: envKey,
      title: formatMessage({ id: `${currentIntlPrefix}.create` }),
      children: <EnvCreateForm intlPrefix={currentIntlPrefix} refresh={refresh} />,
      drawer: true,
      style: modalStyle,
      okText: formatMessage({ id: 'create' }),
    });
  }

  function openGroupModal() {
    Modal.open({
      key: groupKey,
      title: formatMessage({ id: `${currentIntlPrefix}.group.create` }),
      children: <GroupForm dataSet={groupFormDs} treeDs={treeDs} />,
      drawer: true,
      style: modalStyle,
      afterClose: () => {
        groupFormDs.current.reset();
      },
      okText: formatMessage({ id: 'create' }),
    });
  }

  // function toPermissionTab() {
  //   const { getTabKey } = detailStore;
  //   detailStore.setTabKey(ASSIGN_TAB);
  //   treeDs.query();
  //   getTabKey === ASSIGN_TAB && permissionsDs.query();
  // }

  function openEnvDetail() {
    Modal.open({
      key: detailKey,
      title: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      children: <EnvDetail record={getSelectedMenu} isRecord={false} />,
      drawer: true,
      style: modalStyle,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
  }

  function openPermission() {
    const modalPorps = {
      dataSet: permissionsDs,
      nonePermissionDs,
      formatMessage,
      store: modalStore,
      baseDs,
      intlPrefix,
      prefixCls,
      refresh,
      projectId,
    };
    Modal.open({
      key: permissionKey,
      title: <Tips
        helpText={formatMessage({ id: `${intlPrefix}.permission.tips` })}
        title={formatMessage({ id: `${intlPrefix}.modal.permission` })}
      />,
      drawer: true,
      className: 'c7ncd-modal-wrapper',
      style: modalStyle,
      children: <Permission
        {...modalPorps}
      />,
    });
  }

  const openConfigModal = () => {
    const { id } = getSelectedMenu;
    Modal.open({
      key: configKey,
      style: { width: LARGE },
      title: formatMessage({ id: `${currentIntlPrefix}.create.config` }),
      drawer: true,
      children: <DeployConfigForm
        envId={id}
        refresh={refresh}
      />,
    });
  };

  function getButtons() {
    let tooltipsConfig = {};
    if (createEnvBtnDisable) {
      tooltipsConfig = {
        title: '集群环境数量已达上限,无法创建更多环境',
      };
    }
    return [{
      permissions: ['choerodon.code.project.deploy.environment.ps.detail-create-env'],
      name: formatMessage({ id: `${currentIntlPrefix}.create` }),
      icon: 'playlist_add',
      handler: openEnvModal,
      display: true,
      group: 1,
      disabled: createEnvBtnDisable,
      tooltipsConfig,
    }, {
      permissions: ['choerodon.code.project.deploy.environment.ps.detail-create-config'],
      disabled,
      name: formatMessage({ id: `${currentIntlPrefix}.create.config` }),
      icon: 'playlist_add',
      handler: openConfigModal,
      display: true,
      group: 1,
    }, {
      permissions: ['choerodon.code.project.deploy.environment.ps.permission'],
      disabled,
      name: formatMessage({ id: `${intlPrefix}.modal.permission` }),
      icon: 'settings-o',
      handler: openPermission,
      display: true,
      group: 1,
    }, {
      name: formatMessage({ id: `${intlPrefix}.modal.env-detail` }),
      icon: 'find_in_page-o',
      handler: openEnvDetail,
      display: true,
      group: 2,
    }, {
      name: '更多操作',
      groupBtnItems: [
        {
          name: formatMessage({ id: `${currentIntlPrefix}.group.create` }),
          handler: openGroupModal,
        },
      ],
      group: 2,
    }, {
      icon: 'refresh',
      handler: refresh,
      display: true,
      group: 2,
    }];
  }

  return (
    <HeaderButtons items={getButtons()} showClassName />
  );
});

export default EnvModals;
