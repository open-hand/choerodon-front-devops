import React, { useMemo, Fragment } from 'react';
import { Action, Choerodon } from '@choerodon/master';
import {
  Table, Modal, Tooltip, Spin,
} from 'choerodon-ui/pro';
import { UserInfo, TimePopover } from '@choerodon/components';
import ClickText from '@/components/click-text';
import DeployConfigForm from '@/components/deploy-config-form';
import { handlePromptError } from '@/utils';
import { useResourceStore } from '../../../../../../../stores';
import { useREStore } from '../../../../stores';
import { deployValueApi } from '@/api';

const { Column } = Table;
const deleteModalKey = Modal.key();
const modifyModalKey = Modal.key();

export default function DeployConfig() {
  const configModalStyle = useMemo(() => ({
    width: 'calc(100vw - 3.52rem)',
    minWidth: '2rem',
  }), []);
  const {
    intlPrefix,
    formatMessage,
    projectId,
  } = useResourceStore();

  const {
    envStore,
    configDs,
    baseInfoDs,
  } = useREStore();

  const disabled = useMemo(() => {
    const record = baseInfoDs.current;
    const notReady = !record;
    return notReady;
  }, [baseInfoDs.current]);

  function refresh() {
    configDs.query();
  }

  async function checkDelete() {
    const record = configDs.current;
    const valueId = record.get('id');
    const name = record.get('name');
    const deleteModal = Modal.open({
      movable: false,
      closable: false,
      key: deleteModalKey,
      title: formatMessage({ id: `${intlPrefix}.config.delete.disable` }, { name }),
      children: <Spin />,
      footer: null,
    });
    try {
      const res = await deployValueApi.checkDelete(valueId);
      if (handlePromptError(res)) {
        const modalProps = {
          title: formatMessage({ id: `${intlPrefix}.config.delete.disable` }, { name }),
          children: formatMessage({ id: `${intlPrefix}.config.delete.des` }),
          okText: formatMessage({ id: 'delete' }),
          onOk: () => handleDelete(record),
          footer: ((okBtn: any, cancelBtn: any) => (
            <>
              {cancelBtn}
              {okBtn}
            </>
          )),
        };
        deleteModal.update(modalProps);
      } else if (!res.failed) {
        deleteModal.update({
          children: formatMessage({ id: `${intlPrefix}.config.delete.describe` }),
          okCancel: false,
          okText: formatMessage({ id: 'iknow' }),
          footer: ((OkBtn: any) => (
            <>
              {OkBtn}
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
  }

  async function handleDelete(record:any) {
    try {
      const res = await deployValueApi.deleteDeployValue(record.get('id'), null);
      if (handlePromptError(res, false)) {
        refresh();
        return true;
      }
      return false;
    } catch (err) {
      Choerodon.handleResponseError(err);
      return false;
    }
  }

  function openModifyModal(record:any) {
    const valueId = record.get('id');
    const envRecord = baseInfoDs.current;
    const envId = envRecord.get('id');

    Modal.open({
      drawer: true,
      key: modifyModalKey,
      style: configModalStyle,
      title: formatMessage({ id: `${intlPrefix}.modify.config` }),
      children: <DeployConfigForm
        refresh={refresh}
        envId={envId}
        deployConfigId={valueId}
      />,
      okText: formatMessage({ id: 'boot.save' }),
    });
  }

  function renderName({ value, record }:any) {
    return (
      <ClickText
        permissionCode={['choerodon.code.project.deploy.app-deployment.resource.ps.update-deploy-config']}
        clickAble={!disabled}
        value={value}
        onClick={openModifyModal}
        record={record}
        showToolTip
      />
    );
  }

  function renderActions() {
    const actionData = [{
      service: ['choerodon.code.project.deploy.app-deployment.resource.ps.delete-config'],
      text: formatMessage({ id: 'delete' }),
      action: checkDelete,
    }];
    return <Action data={actionData} />;
  }

  function renderUser({ value, record }:any) {
    const url = record.get('createUserUrl');
    return <UserInfo realName={value || ''} avatar={url} />;
  }

  function renderDate({ value }:any) {
    return value ? <TimePopover content={value} /> : null;
  }

  function renderDescription({ value }:any) {
    return (
      <Tooltip title={value}>
        {value}
      </Tooltip>
    );
  }

  return (
    <div className="c7ncd-tab-table">
      <Table
        dataSet={configDs}
        border={false}
      >
        <Column name="name" sortable renderer={renderName} />
        {!disabled && <Column renderer={renderActions} width={70} />}
        <Column name="description" renderer={renderDescription} />
        <Column name="appServiceName" sortable />
        <Column name="envName" sortable />
        <Column name="createUserRealName" renderer={renderUser} />
        <Column name="lastUpdateDate" renderer={renderDate} sortable />
      </Table>
    </div>
  );
}
