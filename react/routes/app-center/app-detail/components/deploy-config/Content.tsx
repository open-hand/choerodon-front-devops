import React, { useCallback } from 'react';
import { Action, Choerodon, HeaderButtons } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';
import {
  Table, Modal, Spin,
} from 'choerodon-ui/pro';
import {
  TableColumnTooltip, Record, UserDTOProps, RecordObjectProps,
} from '@/interface';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import { LARGE } from '@/utils/getModalWidth';
import ClickText from '@/components/click-text';
import { UserInfo, TimePopover } from '@choerodon/components';
import AppCenterDetailServices from '@/routes/app-center/app-detail/services';
import { useDeployConfigStore } from '@/routes/app-center/app-detail/components/deploy-config/stores';
import DeployConfigForm from '@/components/deploy-config-form';

const { Column } = Table;
const createModalKey = Modal.key();
const deleteModalKey = Modal.key();

const DeployConfig = () => {
  const {
    formatMessage,
    intlPrefix,
    detailDs,
    mainStore,
    appServiceId,
  } = useAppCenterDetailStore();

  const {
    tableDs,
    projectId,
  } = useDeployConfigStore();

  const refresh = useCallback(() => {
    tableDs.query();
  }, []);

  const openCreateModal = useCallback((record?: Record) => {
    const { id: envId } = mainStore.getSelectedEnv || {};
    Modal.open({
      key: createModalKey,
      style: { width: LARGE },
      title: formatMessage({ id: `${intlPrefix}.${record ? 'edit' : 'create'}.deployConfig` }),
      drawer: true,
      children: <DeployConfigForm
        envId={envId}
        appServiceId={appServiceId}
        deployConfigId={record?.get('id')}
        refresh={refresh}
        appSelectDisabled
        appServiceName={detailDs.current?.get('name')}
      />,
      okText: formatMessage({ id: record ? 'save' : 'create' }),
    });
  }, [mainStore.getSelectedEnv, appServiceId, detailDs.current]);

  const checkDelete = useCallback(async (record: Record) => {
    const valueId = record?.get('id');
    const name = record?.get('name');
    const deleteModal = Modal.open({
      movable: false,
      closable: false,
      key: deleteModalKey,
      title: formatMessage({ id: `${intlPrefix}.delete.deployConfig` }),
      children: <Spin />,
      footer: null,
    });
    try {
      const res = await AppCenterDetailServices.checkDeleteDeployConfig(projectId, valueId);
      if (res) {
        const modalProps = {
          title: formatMessage({ id: `${intlPrefix}.delete.deployConfig` }),
          children: formatMessage({ id: `${intlPrefix}.delete.deployConfig.des` }, { name }),
          okText: formatMessage({ id: 'delete' }),
          onOk: () => handleDelete(record),
          // okProps: { color: 'red' },
          // cancelProps: { color: 'dark' },
          footer: ((okBtn: HTMLButtonElement, cancelBtn: HTMLButtonElement) => (
            <>
              {cancelBtn}
              {okBtn}
            </>
          )),
        };
        deleteModal.update(modalProps);
      } else if (!res.failed) {
        deleteModal.update({
          children: formatMessage({ id: `${intlPrefix}.delete.deployConfig.disable` }),
          okCancel: false,
          okText: formatMessage({ id: 'iknow' }),
          footer: ((okBtn: HTMLButtonElement) => (
            <>
              {okBtn}
            </>
          )),
        });
      } else {
        deleteModal.close();
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
      deleteModal.close();
    }
  }, [tableDs.current]);

  const handleDelete = async (record: Record) => {
    try {
      const res = await tableDs.delete(record, false);
      if (res && res.success) {
        refresh();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const renderName = ({ value, record }: { value: string, record: Record }) => (
    <ClickText
      permissionCode={['choerodon.code.project.deploy.app-deployment.application-center.deploy-config.edit']}
      clickAble
      value={value}
      onClick={openCreateModal}
      record={record}
      showToolTip
    />
  );

  const renderActions = ({ record }: RecordObjectProps) => {
    const actionData = [{
      service: ['choerodon.code.project.deploy.app-deployment.application-center.deploy-config.delete'],
      text: formatMessage({ id: 'delete' }),
      action: () => checkDelete(record),
    }];
    return <Action data={actionData} />;
  };

  const renderUser = ({ value }: { value: UserDTOProps }) => {
    const {
      ldap, realName, loginName, email, imageUrl,
    } = value || {};
    return (
      <UserInfo
        realName={realName || ''}
        loginName={ldap ? loginName : email}
        avatar={imageUrl}
      />
    );
  };

  const renderDate = ({ value }: { value: string }) => (
    value ? <TimePopover content={value} /> : null
  );

  return (
    <>
      <HeaderButtons
        items={[{
          permissions: ['choerodon.code.project.deploy.app-deployment.application-center.deploy-config.create'],
          name: '创建部署配置',
          icon: 'playlist_add',
          handler: () => openCreateModal(),
          display: true,
        }, {
          icon: 'refresh',
          handler: refresh,
          display: true,
        }]}
        showClassName
      />
      <Table
        dataSet={tableDs}
        className="c7ncd-tab-table"
      >
        <Column name="name" renderer={renderName} />
        <Column renderer={renderActions} width={60} />
        <Column name="description" tooltip={'overflow' as TableColumnTooltip} />
        <Column name="creator" renderer={renderUser} />
        <Column name="lastUpdateDate" renderer={renderDate} width={120} />
      </Table>
    </>
  );
};

export default observer(DeployConfig);
