import React, { useCallback } from 'react';
import {
  Page, Header, Breadcrumb, Content, Permission, Action, Choerodon, HeaderButtons,
} from '@choerodon/master';
import { Table, Modal } from 'choerodon-ui/pro';
import { Button } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import isEmpty from 'lodash/isEmpty';
import { useAppTemplateStore } from '@/routes/app-template/stores';
import TimePopover from '@/components/time-popover';
import TemplateServices from '@/routes/app-template/services';
import { Record } from '@/interface';
import AddTemplate from './components/addTemplate';
import { mapping } from './stores/TableDataSet';

import './index.less';

const { Column } = Table;

const TemplateTable = observer(() => {
  const {
    formatMessage,
    prefixCls,
    intlPrefix,
    tableDs,
    organizationId,
    permissionCodes,
    pageType,
    formatCommon,
    format,
  } = useAppTemplateStore();

  const refresh = useCallback(() => {
    tableDs.query();
  }, []);

  /**
   * 创建自定义模板
   */
  const handleCreateAppTemplate = useCallback((record?: Record) => {
    const templateId = record ? record.get('id') : null;
    Modal.open({
      title: format({ id: `title.${templateId ? 'edit' : 'create'}` }),
      key: Modal.key(),
      children: <AddTemplate refresh={refresh} templateId={templateId} pageType={pageType} />,
      drawer: true,
      okText: format({ id: templateId ? 'save' : 'create' }),
      style: { width: '3.8rem' },
    });
  }, []);

  const openOperationModal = useCallback((modalProps) => {
    Modal.open({
      key: Modal.key(),
      movable: false,
      ...modalProps,
    });
  }, []);

  const openEnabledModal = useCallback(({ record }) => {
    if (!record) {
      return;
    }
    const enabled = record.get('enable');
    if (enabled) {
      Modal.open({
        key: Modal.key(),
        title: format({ id: 'enable.title' }, { name: record.get('name') }),
        children: format({ id: 'enable.des' }),
        movable: false,
        onOk: () => handleEnabled(true, record),
      });
    } else {
      handleEnabled(false, record);
    }
  }, []);

  const handleEnabled = useCallback(async (enabled: boolean, record: Record) => {
    if (!record) {
      return false;
    }
    try {
      if (await TemplateServices.handleEnabled(record.get('id'), enabled ? 'disable' : 'enable', organizationId)) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  }, []);

  const openPermissionModal = useCallback(({ record }) => {
    if (!record) {
      return;
    }
    openOperationModal({
      title: format({ id: 'permission.title' }),
      children: format({ id: 'permission.des' }),
      onOk: () => handlePermission({ record }),
    });
  }, []);

  const handlePermission = useCallback(async ({ record }) => {
    if (!record) {
      return;
    }
    try {
      await TemplateServices.addTemplatePermission(record.get('id'), organizationId);
      refresh();
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
  }, []);

  const handleDelete = useCallback(({ record }) => {
    if (!record) {
      return;
    }
    const modalProps = {
      title: format({ id: 'delete.title' }, { name: record.get('name') }),
      children: format({ id: 'delete.des' }),
      okText: format({ id: 'delete' }),
    };
    tableDs.delete(record, modalProps);
  }, []);

  const openNoPermissionModal = useCallback(() => {
    openOperationModal({
      title: format({ id: 'permission.no.title' }),
      children: format({ id: 'permission.no.des' }),
      okText: format({ id: 'iknow' }),
      okCancel: false,
    });
  }, []);

  const renderName = useCallback(({ value, record }) => {
    // type 为P：预定义；C: 自定义
    if (record.get('type') === 'P' || record.get('status') !== 'S' || !record.get('enable')) {
      return <span>{value}</span>;
    }
    return (
      <Permission
        service={permissionCodes.edit}
        defaultChildren={(<span className="table-unClick">{value}</span>)}
      >
        <span
          role="none"
          onClick={() => handleCreateAppTemplate(record)}
          className="table-link"
        >
          {value}
        </span>
      </Permission>
    );
  }, []);

  const renderDate = useCallback(({ value }) => <TimePopover datetime={value} />, []);

  const renderUrl = useCallback(({ value, record }) => {
    const text = value ? `../${value.split('/')[value.split('/').length - 1]}` : '';
    if (record && !record.get('permission')) {
      return (
        <span
          role="none"
          onClick={openNoPermissionModal}
          className={`${prefixCls}-table-url`}
        >
          {text}
        </span>
      );
    }
    return (
      <a href={value} rel="nofollow me noopener noreferrer" target="_blank">
        {text}
      </a>
    );
  }, []);

  const renderSource = useCallback(({ value }) => (value === 'C' ? '自定义' : '预定义'), []);

  const renderStatus = useCallback(({ value, record }) => {
    // eslint-disable-next-line no-nested-ternary
    const status = value === 'S' ? (record.get('enable') ? 'enable' : 'disable') : value;
    return (
      <span className={`${prefixCls}-table-status ${prefixCls}-table-status-${status}`}>
        {format({ id: `status.${status}` })}
      </span>
    );
  }, []);

  const renderAction = useCallback(({ record }) => {
    const enabled = record.get('enable');
    const status = record.get('status');
    const builtIn = record.get('type') === 'P';
    const hasPermission = record.get('permission');
    const deleteData = ({
      service: permissionCodes.delete,
      text: formatCommon({ id: 'delete' }),
      action: () => handleDelete({ record }),
    });
    const actionData = [];
    switch (status) {
      case 'S':
        actionData.push({
          service: permissionCodes[enabled ? 'disable' : 'enable'],
          text: enabled ? formatCommon({ id: 'stop' }) : formatCommon({ id: 'enable' }),
          action: () => openEnabledModal({ record }),
        });
        if (!enabled) {
          actionData.push(deleteData);
        } else if (!hasPermission) {
          actionData.push({
            service: permissionCodes.permission,
            text: format({ id: 'getGitlabPermission' }),
            action: () => openPermissionModal({ record }),
          });
        }
        break;
      case 'F':
        actionData.push(deleteData);
        break;
      default:
        break;
    }
    return !builtIn && !isEmpty(actionData) && <Action data={actionData} />;
  }, []);

  return (
    <Page>
      <Header>
        <HeaderButtons
          items={([{
            name: format({ id: 'title.create' }),
            icon: 'playlist_add',
            display: 'true',
            permissions: permissionCodes.create,
            handler: () => handleCreateAppTemplate(),
          }, {
            icon: 'refresh',
            display: true,
            handler: refresh,
          }])}
          showClassName={false}
        />
      </Header>
      <Breadcrumb />
      <Content>
        <Table dataSet={tableDs} className="table-default-color">
          <Column name={mapping.appTemplate.name} renderer={renderName} />
          <Column renderer={renderAction} width={60} />
          <Column name={mapping.temCode.name} />
          <Column name={mapping.repo.name} renderer={renderUrl} />
          <Column name={mapping.source.name} renderer={renderSource} width={100} />
          <Column name={mapping.createTime.name} renderer={renderDate} width={100} />
          <Column name={mapping.status.name} renderer={renderStatus} width={80} />
        </Table>
      </Content>
    </Page>
  );
});

export default TemplateTable;
