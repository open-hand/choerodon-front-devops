import React, { useMemo, Fragment, useCallback } from 'react';
import { Action, Choerodon, HeaderButtons } from '@choerodon/boot';
import { observer } from 'mobx-react-lite';
import {
  Table, Modal, Tooltip, Spin,
} from 'choerodon-ui/pro';
import { TableColumnTooltip, Record } from '@/interface';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import { LARGE } from '@/utils/getModalWidth';
import TimePopover from '@/components/time-popover';
import UserInfo from '@/components/userInfo';
import ClickText from '@/components/click-text';
import { useDeployConfigStore } from '@/routes/app-center/app-detail/deploy-config/stores';
import DeployConfigForm from './create-from';

const { Column } = Table;
const createModalKey = Modal.key();
const deleteModalKey = Modal.key();
const modifyModalKey = Modal.key();

const DeployConfig = () => {
  const {
    formatMessage,
    prefixCls,
    intlPrefix,
    detailDs,
    mainStore,
    appServiceId,
  } = useAppCenterDetailStore();

  const {
    tableDs,
  } = useDeployConfigStore();

  const refresh = useCallback(() => {
    tableDs.query();
  }, []);

  const openCreateModal = useCallback((record?: Record) => {
    const { id: envId } = mainStore.getSelectedEnv || {};
    Modal.open({
      key: createModalKey,
      style: { width: LARGE },
      title: '创建部署配置',
      drawer: true,
      children: <DeployConfigForm
        envId={envId}
        appServiceId={appServiceId}
        deployConfigId={record?.get('id')}
        refresh={refresh}
        appSelectDisabled
        appServiceName={detailDs.current?.get('name')}
      />,
    });
  }, [mainStore.getSelectedEnv, appServiceId, detailDs.current]);

  async function checkDelete() {
    // const record = configDs.current;
    // const valueId = record.get('id');
    // const name = record.get('name');
    // const deleteModal = Modal.open({
    //   movable: false,
    //   closable: false,
    //   key: deleteModalKey,
    //   title: formatMessage({ id: `${intlPrefix}.config.delete.disable` }, { name }),
    //   children: <Spin />,
    //   footer: null,
    // });
    // try {
    //   const res = await envStore.checkDelete(projectId, valueId);
    //   if (handlePromptError(res)) {
    //     const modalProps = {
    //       title: formatMessage({ id: `${intlPrefix}.config.delete.disable` }, { name }),
    //       children: formatMessage({ id: `${intlPrefix}.config.delete.des` }),
    //       okText: formatMessage({ id: 'delete' }),
    //       onOk: () => handleDelete(record),
    //       okProps: { color: 'red' },
    //       cancelProps: { color: 'dark' },
    //       footer: ((okBtn, cancelBtn) => (
    //         <>
    //           {okBtn}
    //           {cancelBtn}
    //         </>
    //       )),
    //     };
    //     // configDs.delete(record, modalProps);
    //     deleteModal.update(modalProps);
    //   } else if (!res.failed) {
    //     deleteModal.update({
    //       children: formatMessage({ id: `${intlPrefix}.config.delete.describe` }),
    //       okCancel: false,
    //       okText: formatMessage({ id: 'iknow' }),
    //       footer: ((OkBtn) => (
    //         <>
    //           {OkBtn}
    //         </>
    //       )),
    //     });
    //   } else {
    //     deleteModal.close();
    //   }
    // } catch (e) {
    //   Choerodon.handleResponseError(e);
    //   deleteModal.close();
    // }
  }

  const handleDelete = (record: any) => {
    // try {
    //   const res = await envStore.deleteRecord(projectId, record.get('id'));
    //   if (handlePromptError(res, false)) {
    //     refresh();
    //   } else {
    //     return false;
    //   }
    // } catch (err) {
    //   Choerodon.handleResponseError(err);
    //   return false;
    // }
  };

  const renderName = ({ value, record }: { value: string, record: Record }) => (
    <ClickText
      permissionCode={['choerodon.code.project.deploy.app-deployment.resource.ps.update-deploy-config']}
      clickAble
      value={value}
      onClick={openCreateModal}
      record={record}
      showToolTip
    />
  );

  const renderActions = () => {
    const actionData = [{
      service: ['choerodon.code.project.deploy.app-deployment.resource.ps.delete-config'],
      text: formatMessage({ id: 'delete' }),
      action: checkDelete,
    }];
    return <Action data={actionData} />;
  };

  const renderUser = ({ value, record }: { value: string, record: Record }) => (
    <UserInfo name={value || ''} avatar={record.get('createUserUrl')} />
  );

  const renderDate = ({ value }: { value: string }) => (
    value ? <TimePopover datetime={value} /> : null
  );

  return (
    <>
      <HeaderButtons
        className={`${prefixCls}-detail-headerButton`}
        items={[{
          permissions: [],
          name: '创建部署配置',
          icon: 'playlist_add',
          handler: () => openCreateModal(),
          display: true,
        }, {
          icon: 'refresh',
          handle: refresh,
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
        <Column name="createUserRealName" renderer={renderUser} />
        <Column name="lastUpdateDate" renderer={renderDate} />
      </Table>
    </>
  );
};

export default observer(DeployConfig);
