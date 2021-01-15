/* eslint-disable */
import React, { useEffect, useState, Fragment, useRef } from 'react';
import { Table, Modal, TextField } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { FormattedMessage } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import {
  Page, Content, Header, Permission, Action, Breadcrumb, Choerodon,
} from '@choerodon/boot';
import {
  SagaDetails,
} from '@choerodon/master';
import {
  Button, Spin, Tooltip, Icon,
} from 'choerodon-ui';
import pick from 'lodash/pick';
import ServiceDetail from "@/routes/app-service/service-detail";
import TimePopover from '../../../components/timePopover';
import { useAppTopStore } from '../stores';
import { useAppServiceStore } from './stores';
import CreateForm from '../modals/creat-form';
import EditForm from '../modals/edit-form';
import ImportForm from './modal/import-form';
import StatusTag from '../components/status-tag';
import { handlePromptError } from '../../../utils';

import './index.less';
import ClickText from "../../../components/click-text";

const TabPane = Tabs.TabPane;

const { Column } = Table;
const modalKey1 = Modal.key();
const modalKey2 = Modal.key();
const modalKey3 = Modal.key();
const createModalKey = Modal.key();
const editModalKey = Modal.key();
const modalStyle1 = {
  width: 380,
};
const modalStyle2 = {
  width: 'calc(100vw - 3.52rem)',
};

const ListView = withRouter(observer((props) => {
  const {
    intlPrefix,
    prefixCls,
    listPermissions,
    appServiceStore,
  } = useAppTopStore();

  const ref = useRef();

  const {
    intl: { formatMessage },
    AppState,
    AppState: {
      currentMenuType: { projectId },
    },
    listDs,
    appListStore,
  } = useAppServiceStore();

  if (AppState.getCurrentTheme === 'theme4') {
    import('./theme4.less');
  }

  const [isInit, setIsInit] = useState(true);
  const [selectedAppService, setSelectedAppService] = useState(undefined);

  useEffect(() => {
    // 确定dataset加载完毕后才打开创建框
    // 否则会造成dataset实例丢失
    if (isInit && listDs.status === 'ready') {
      const { location: { state } } = props;
      if (state && state.openCreate) {
        openCreate();
      }
      setIsInit(false);
      setSelectedAppService(listDs.records[0].toData());
    }
  }, [listDs.status]);

  function refresh() {
    listDs.query();
    appListStore.checkCreate(projectId);
  }

  const openSagaDetails = (id) => {
    Modal.open({
      title: formatMessage({ id: 'global.saga-instance.detail' }),
      key: Modal.key(),
      children: <SagaDetails sagaInstanceId={id} instance />,
      drawer: true,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
      style: {
        width: 'calc(100% - 3.5rem)',
      },
    });
  };

  const handleLinkDetail = (record) => {
    const {
      location: {
        search,
        pathname,
      },
      history,
    } = props;
    history.push({
      pathname: `${pathname}/detail/${record.get('id')}`,
      search,
    })
  };

  function renderName({ value, record }) {
    const {
      location: {
        search,
        pathname,
      },
    } = props;
    const canLink = !record.get('fail') && record.get('synchro');
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={value} placement="top">
          <span className={`${prefixCls}-table-name`}>
            <ClickText
              value={value}
              clickAble={canLink}
              onClick={handleLinkDetail}
              record={record}
            />
          </span>
        </Tooltip>
        {record.get('sagaInstanceId') ? (
          <Icon
            className={`${prefixCls}-table-dashBoard`}
            type="developer_board"
            onClick={() => openSagaDetails(record.get('sagaInstanceId'))}
          />
        ) : ''}
      </div>
    );
  }

  function renderType({ value }) {
    return value && <FormattedMessage id={`${intlPrefix}.type.${value}`} />;
  }

  function renderDate({ value }) {
    return <TimePopover content={value} />;
  }

  function renderUrl({ value }) {
    return (
      <a href={value} rel="nofollow me noopener noreferrer" target="_blank">
        {value ? `../${value.split('/')[value.split('/').length - 1]}` : ''}
      </a>
    );
  }

  function renderStatus({ value, record }) {
    return (
      <StatusTag
        active={value}
        fail={record.get('fail')}
        synchro={record.get('synchro')}
      />
    );
  }

  function renderActions({ record }) {
    const actionData = {
      detail: {
        service: ['choerodon.code.project.develop.app-service.ps.default'],
        text: formatMessage({ id: `${intlPrefix}.detail`}),
        action: ref?.current?.openDetail,
      },
      edit: {
        service: ['choerodon.code.project.develop.app-service.ps.update'],
        text: formatMessage({ id: 'edit' }),
        action: openEdit,
      },
      stop: {
        service: ['choerodon.code.project.develop.app-service.ps.disable'],
        text: formatMessage({ id: 'stop' }),
        action: openStop.bind(this, record),
      },
      run: {
        service: ['choerodon.code.project.develop.app-service.ps.enable'],
        text: formatMessage({ id: 'active' }),
        action: () => changeActive(true),
      },
      delete: {
        service: ['choerodon.code.project.develop.app-service.ps.delete'],
        text: formatMessage({ id: 'delete' }),
        action: handleDelete,
      },

    };
    let actionItems;
    if (record.get('fail')) {
      actionItems = pick(actionData, ['delete', 'detail']);
    } else if (record.get('synchro') && record.get('active')) {
      actionItems = pick(actionData, ['edit', 'stop', 'detail']);
    } else if (record.get('sagaInstanceId')) {
      actionItems = pick(actionData, ['delete', 'detail']);
    } else if (record.get('active')) {
      return;
    } else {
      actionItems = pick(actionData, ['run', 'delete', 'detail']);
    }
    if (AppState.getCurrentTheme !== 'theme4') {
      delete actionItems.detail;
    }
    return <Action data={Object.values(actionItems)} />;
  }

  function handleCancel(dataSet) {
    const { current } = dataSet;
    if (current.status === 'add') {
      dataSet.remove(current);
    } else {
      current.reset();
    }
  }

  function openCreate() {
    Modal.open({
      key: createModalKey,
      drawer: true,
      style: modalStyle1,
      title: formatMessage({ id: `${intlPrefix}.create` }),
      children: <CreateForm
        refresh={refresh}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
      />,
      okText: formatMessage({ id: 'create' }),
    });
  }

  function openImport() {
    Modal.open({
      key: modalKey2,
      drawer: true,
      style: modalStyle2,
      title: formatMessage({ id: `${intlPrefix}.import` }),
      children: <ImportForm
        appServiceStore={appServiceStore}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        refresh={refresh}
      />,
      okText: formatMessage({ id: 'import' }),
    });
  }

  function openEdit() {
    const appServiceId = listDs.current.get('id');

    Modal.open({
      key: editModalKey,
      drawer: true,
      style: modalStyle1,
      title: formatMessage({ id: `${intlPrefix}.edit` }),
      children: <EditForm
        refresh={refresh}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        appServiceId={appServiceId}
      />,
      okText: formatMessage({ id: 'save' }),
    });
  }

  // 因为在应用服务那边做了最近访问前端缓存，如果要删除，也必须要删除这个缓存
  function checkLocalstorage(appId) {
    const recentApp = JSON.parse(localStorage.getItem('recent-app'));
    if (recentApp && recentApp[projectId]) {
      const currentProjectApp = recentApp[projectId];
      const hasData = currentProjectApp.filter((item) => item.id !== appId);
      if (hasData.length < currentProjectApp.length) {
        recentApp[projectId] = hasData;
        localStorage.setItem('recent-app', JSON.stringify(recentApp));
      }
    }
  }

  async function handleDelete() {
    const record = listDs.current;
    const appId = record.get('id');
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.delete.title` }, { name: record.get('name') }),
      children: formatMessage({ id: `${intlPrefix}.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
      okProps: { color: 'red' },
      cancelProps: { color: 'dark' },
    };
    const res = await listDs.delete(record, modalProps);
    if (res && res.success) {
      refresh();
      checkLocalstorage(appId);
    }
  }

  async function changeActive(active) {
    if (!active) {
      Modal.open({
        key: modalKey3,
        title: formatMessage({ id: `${intlPrefix}.stop` }, { name: listDs.current.get('name') }),
        children: <FormattedMessage id={`${intlPrefix}.stop.tips`} />,
        onOk: () => handleChangeActive(active),
        okText: formatMessage({ id: 'stop' }),
      });
    } else {
      handleChangeActive(active);
    }
  }

  async function handleChangeActive(active) {
    try {
      if (await appServiceStore.changeActive(projectId, listDs.current.get('id'), active)) {
        checkLocalstorage(listDs.current.get('id'));
        refresh();
      } else {
        return false;
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  }

  function openStop(record) {
    const id = record.get('id');

    const stopModal = Modal.open({
      key: modalKey3,
      title: formatMessage({ id: `${intlPrefix}.check` }),
      children: <Spin />,
      footer: null,
    });

    appServiceStore.checkAppService(projectId, id).then((res) => {
      if (handlePromptError(res)) {
        const { checkResources, checkRule, checkCi } = res;
        const status = checkResources || checkRule || checkCi;
        let childrenContent;

        if (!status) {
          childrenContent = <FormattedMessage id={`${intlPrefix}.stop.tips`} />;
        } else if (checkCi) {
          childrenContent = '该应用服务下存在流水线资源，无法停用。';
        } else if (checkResources && !checkRule) {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.resource` });
        } else if (!checkResources && checkRule) {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.rules` });
        } else {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.both` });
        }

        const statusObj = {
          title: status ? formatMessage({ id: `${intlPrefix}.cannot.stop` }, { name: listDs.current.get('name') }) : formatMessage({ id: `${intlPrefix}.stop` }, { name: listDs.current.get('name') }),
          // eslint-disable-next-line no-nested-ternary
          children: childrenContent,
          okCancel: !status,
          onOk: () => (status ? stopModal.close() : handleChangeActive(false)),
          okText: status ? formatMessage({ id: 'iknow' }) : formatMessage({ id: 'stop' }),
          footer: ((okBtn, cancelBtn) => (
            <>
              {okBtn}
              {!status && cancelBtn}
            </>
          )),
        };
        stopModal.update(statusObj);
      } else {
        stopModal.close();
      }
    }).catch((err) => {
      stopModal.close();
      Choerodon.handleResponseError(err);
    });
  }

  function getHeader() {
    const disabled = !appListStore.getCanCreate;
    const disabledMessage = disabled ? formatMessage({ id: `${intlPrefix}.create.disabled` }) : '';
    return (
      <Header title={<FormattedMessage id="app.head" />}>
        <Permission
          service={['choerodon.code.project.develop.app-service.ps.create']}
        >
          <Tooltip title={disabledMessage} placement="bottom">
            <Button
              icon="playlist_add"
              disabled={disabled}
              onClick={openCreate}
            >
              <FormattedMessage id={`${intlPrefix}.create`} />
            </Button>
          </Tooltip>
        </Permission>
        <Permission
          service={['choerodon.code.project.develop.app-service.ps.import']}
        >
          <Tooltip title={disabledMessage} placement="bottom">
            <Button
              icon="archive"
              disabled={disabled}
              onClick={openImport}
            >
              <FormattedMessage id={`${intlPrefix}.import`} />
            </Button>
          </Tooltip>
        </Permission>
        <Permission
          service={['choerodon.code.project.develop.app-service.ps.permission.update']}
        >
          <Button
            icon="authority"
            onClick={() => {
              const {
                history,
                location,
              } = props;
              history.push(`/rducm/code-lib-management/assign${location.search}`);
            }}
          >
            权限管理
          </Button>
        </Permission>
        <Button
          icon="refresh"
          onClick={refresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
    );
  }

  const renderTheme4Dom = () => {
    return (
      <div className="c7ncd-theme4-appService">
        <div className="c7ncd-theme4-appService-left">
          {
            listDs.records.map(record => (
              <div
                className="c7ncd-appService-item"
                style={{
                  background: record.get('id') === selectedAppService?.id ? 'rgba(104, 135, 232, 0.08)' : 'unset',
                }}
                onClick={() => setSelectedAppService(record.toData())}
              >
                <span
                  className="c7ncd-appService-item-icon"
                  style={{
                    backgroundImage: record.get('imgUrl') ? `url(${record.get('imgUrl')})` : 'unset',
                  }}
                >
                  {
                    !record.get('imgUrl') && record.get('name').substring(0,1).toUpperCase()
                  }
                </span>
                <div className="c7ncd-appService-item-center">
                  <div className="c7ncd-appService-item-center-line">
                    <span className="c7ncd-appService-item-center-line-name">{record.get('name')}</span>
                    <StatusTag
                      active={record.get('active')}
                      fail={record.get('fail')}
                      synchro={record.get('synchro')}
                    />
                    <span className="c7ncd-appService-item-center-line-type">
                      <FormattedMessage id={`${intlPrefix}.type.${record.get('type')}`} />
                    </span>
                    {renderActions({record})}
                  </div>
                  <div className="c7ncd-appService-item-center-line">
                    <p className="c7ncd-appService-item-center-line-code">{record.get('code')}</p>
                  </div>
                </div>
                <div
                  className="c7ncd-appService-item-center"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    width: 'unset',
                  }}
                >
                  <div className="c7ncd-appService-item-center-line">
                    <p className="c7ncd-appService-item-center-line-url">
                      {
                        record.get('repoUrl') && (
                          <>
                            <Icon className="c7ncd-appService-item-center-line-url-git" type="git" />
                            {renderUrl({ value: record.get('repoUrl') })}
                          </>
                        )
                      }
                    </p>
                  </div>
                  <div className="c7ncd-appService-item-center-line">
                    <span className="c7ncd-appService-item-center-line-updateUserName">
                      {record.get('updateUserName')?.substring(0,1)?.toUpperCase()}
                    </span>
                    <span className="c7ncd-appService-item-center-line-gxy">更新于</span>
                    {
                      record.get('lastUpdateDate') &&
                      <TimePopover content={record.get('lastUpdateDate')} />
                    }
                    <span style={{ marginLeft: 31 }} className="c7ncd-appService-item-center-line-updateUserName">
                      {record.get('createUserName')?.substring(0,1)?.toUpperCase()}
                    </span>
                    <span className="c7ncd-appService-item-center-line-gxy">创建于</span>
                    {
                      record.get('creationDate') &&
                      <TimePopover content={record.get('creationDate')} />
                    }
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        <div className="c7ncd-theme4-appService-right">
          <ServiceDetail
            cRef={ref}
            match={{
              params: {
                id: selectedAppService?.id,
                projectId: AppState.currentMenuType.projectId,
              }
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <Page service={listPermissions}>
      {getHeader()}
      <Breadcrumb
        {
          ...AppState.getCurrentTheme === 'theme4' ? {
            extraNode: (
              <TextField
                className="theme4-c7n-member-search"
                placeholder="搜索成员"
                style={{ marginLeft: 32 }}
                suffix={(
                  <Icon type="search" />
                )}
              />),
          } : {}
        }
      />
      <Content className={`${prefixCls}-content`}>
        {
          AppState.getCurrentTheme === 'theme4' ? renderTheme4Dom() : (
            <Table
              dataSet={listDs}
              border={false}
              queryBar="bar"
              pristine
              className={`${prefixCls}.table`}
              rowClassName="c7ncd-table-row-font-color"
            >
              <Column name="name" renderer={renderName} sortable />
              <Column renderer={renderActions} width="0.7rem" />
              <Column name="code" sortable />
              <Column name="type" renderer={renderType} />
              <Column name="repoUrl" renderer={renderUrl} />
              <Column name="creationDate" renderer={renderDate} sortable />
              <Column name="active" renderer={renderStatus} width="0.7rem" align="left" />
            </Table>
          )
        }
      </Content>
    </Page>
  );
}));

export default ListView;
