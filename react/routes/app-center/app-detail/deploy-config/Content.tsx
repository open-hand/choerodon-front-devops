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

const { Column } = Table;
const deleteModalKey = Modal.key();
const modifyModalKey = Modal.key();

const DeployConfig = () => {
  const {
    formatMessage,
    prefixCls,
    intlPrefix,
    detailDs,
  } = useAppCenterDetailStore();

  const {
    tableDs,
  } = useDeployConfigStore();

  const disabled = useMemo(() => {
    const record = detailDs.current;
    return !record;
  }, [detailDs.current]);

  const refresh = useCallback(() => {

  }, []);

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

  const handleDelete = (record) => {
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

  const openModifyModal = (record) => {
    Modal.open({
      drawer: true,
      key: modifyModalKey,
      style: { width: LARGE },
      title: '创建部署配置',
      // children: <DeployConfigForm
      //   isModify
      //   store={envStore}
      //   dataSet={configFormDs}
      //   refresh={refresh}
      //   envId={envId}
      //   intlPrefix={intlPrefix}
      //   prefixCls={prefixCls}
      // />,
      children: '创建部署配置',
      // afterClose: () => {
      //   configFormDs.transport.read = null;
      //   configFormDs.reset();
      //   envStore.setValue('');
      // },
      okText: formatMessage({ id: 'save' }),
    });
  };

  const renderName = ({ value, record }: { value: string, record: Record }) => (
    <ClickText
      permissionCode={['choerodon.code.project.deploy.app-deployment.resource.ps.update-deploy-config']}
      clickAble={!disabled}
      value={value}
      onClick={openModifyModal}
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
          disabled,
          name: '创建部署配置',
          icon: 'playlist_add',
          handler: () => {},
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
        <Column name="name" sortable renderer={renderName} />
        {!disabled && <Column renderer={renderActions} width={60} />}
        <Column name="description" tooltip={'overflow' as TableColumnTooltip} />
        <Column name="appServiceName" sortable />
        <Column name="envName" sortable />
        <Column name="createUserRealName" renderer={renderUser} />
        <Column name="lastUpdateDate" renderer={renderDate} sortable />
      </Table>
    </>
  );
};

export default observer(DeployConfig);
