import React, { useCallback } from 'react';
import {
  Page, Header, Breadcrumb, Content, Permission, Action, Choerodon,
} from '@choerodon/boot';
import { Table, Modal } from 'choerodon-ui/pro';
import { Button } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { useAppTemplateStore } from '@/routes/app-template/stores';
import TimePopover from '@/components/time-popover';
import TemplateServices from '@/routes/app-template/services';
import { Record } from '@/interface';
import isEmpty from 'lodash/isEmpty';
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
      title: formatMessage({ id: `${intlPrefix}.title.${templateId ? 'edit' : 'create'}` }),
      key: Modal.key(),
      children: <AddTemplate refresh={refresh} templateId={templateId} pageType={pageType} />,
      drawer: true,
      okText: formatMessage({ id: templateId ? 'save' : 'create' }),
      style: { width: '3.8rem' },
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
        title: formatMessage({ id: `${intlPrefix}.enable.title` }, { name: record.get('name') }),
        children: formatMessage({ id: `${intlPrefix}.enable.des` }),
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

  const handlePermission = useCallback(async ({ record }) => {
    if (!record) {
      return;
    }
    try {
      TemplateServices.addTemplatePermission(record.get('id'), organizationId);
    } catch (e) {
      Choerodon.handleResponseError(e);
    }
  }, []);

  const handleDelete = useCallback(({ record }) => {
    if (!record) {
      return;
    }
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.delete.title` }, { name: record.get('name') }),
      children: formatMessage({ id: `${intlPrefix}.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
      okProps: { color: 'red' },
      cancelProps: { color: 'dark' },
    };
    tableDs.delete(record, modalProps);
  }, []);

  const renderName = useCallback(({ value, record }) => {
    // type 为P：预定义；C: 自定义
    if (record.get('type') === 'P' || !record.get('enable')) {
      return <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>{value}</span>;
    }
    return (
      <Permission
        service={permissionCodes.edit}
        defaultChildren={(<span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>{value}</span>)}
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

  const renderUrl = useCallback(({ value }) => (
    <a href={value} rel="nofollow me noopener noreferrer" target="_blank">
      {value ? `../${value.split('/')[value.split('/').length - 1]}` : ''}
    </a>
  ), []);

  const renderSource = useCallback(({ value }) => (value === 'C' ? '自定义' : '预定义'), []);

  const renderStatus = useCallback(({ value, record }) => {
    // eslint-disable-next-line no-nested-ternary
    const status = value === 'S' ? (record.get('enable') ? 'enable' : 'disable') : value;
    return (
      <span className={`${prefixCls}-table-status ${prefixCls}-table-status-${status}`}>
        {formatMessage({ id: `${intlPrefix}.status.${status}` })}
      </span>
    );
  }, []);

  const renderAction = useCallback(({ record }) => {
    const enabled = record.get('enable');
    const status = record.get('status');
    const builtIn = record.get('type') === 'P';
    const deleteData = ({
      service: permissionCodes.delete,
      text: '删除',
      action: () => handleDelete({ record }),
    });
    const actionData = [];
    switch (status) {
      case 'S':
        actionData.push({
          service: permissionCodes[enabled ? 'disable' : 'enable'],
          text: enabled ? '停用' : '启用',
          action: () => openEnabledModal({ record }),
        });
        if (!enabled) {
          actionData.push(deleteData);
        } else {
          actionData.push({
            service: permissionCodes.permission,
            text: '获取GitLab仓库权限',
            action: () => handlePermission({ record }),
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
        <Permission service={permissionCodes.create}>
          <Button
            icon="playlist_add"
            onClick={() => handleCreateAppTemplate()}
          >
            {formatMessage({ id: `${intlPrefix}.title.create` })}
          </Button>
        </Permission>
        <Button
          icon="refresh"
          onClick={refresh}
        >
          {formatMessage({ id: 'refresh' })}
        </Button>
      </Header>
      <Breadcrumb />
      <Content>
        <Table dataSet={tableDs} className="table-default-color">
          <Column name={mapping.appTemplate.name} renderer={renderName} />
          <Column renderer={renderAction} width={50} />
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
