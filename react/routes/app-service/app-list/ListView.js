/* eslint-disable */
import React, { useEffect, useState, Fragment, useRef } from 'react';
import { Table, Modal, TextField, Pagination } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { FormattedMessage } from 'react-intl';
import { useFormatMessage } from '@choerodon/master';
import { withRouter } from 'react-router-dom';
import {
  Page, Content, Header, Action, Breadcrumb, Choerodon, HeaderButtons
} from '@choerodon/master';
import {
  SagaDetails,
} from '@choerodon/master';
import {
  Spin, Tooltip, Icon,
} from 'choerodon-ui';
import pick from 'lodash/pick';
import ServiceDetail from "@/routes/app-service/service-detail";
import TimePopover from '../../../components/timePopover';
import { useAppTopStore } from '../stores';
import { useAppServiceStore } from './stores';
import CreateForm from '../modals/creat-form';
import EditForm from '../modals/edit-form';
import ImportForm from './modal/import-form';
import { StatusTag, Loading } from '@choerodon/components';
import { handlePromptError } from '../../../utils';

import './index.less';
import './theme4.less';
import ClickText from "../../../components/click-text";
import { useDebounceFn } from 'ahooks';

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
  const searchRef = useRef();

  const format = useFormatMessage('c7ncd.appService');

  const {
    intl: { formatMessage },
    AppState,
    AppState: {
      currentMenuType: { projectId },
    },
    listDs,
    appListStore,
  } = useAppServiceStore();

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
      if (listDs.records && listDs.records.length > 0) {
        setSelectedAppService(listDs.records[0].toData());
      }
    }
  }, [listDs.status]);

  function refresh () {
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

  const getItemsButton = () => {
    const disabled = !appListStore.getCanCreate;
    const disabledMessage = disabled ? formatMessage({ id: `${intlPrefix}.create.disabled` }) : '';
    const { openImport } = props;

    return ([{
      name: format({ id: 'createAppService' }),
      icon: 'playlist_add',
      permissions: ['choerodon.code.project.develop.app-service.ps.create'],
      display: true,
      handler: openCreate,
      disabled,
      disabledMessage,
    }, {
      name: format({ id: 'importAppService' }),
      icon: 'archive-o',
      permissions: ['choerodon.code.project.develop.app-service.ps.import'],
      display: true,
      handler: openImport,
      disabled,
      disabledMessage,
    }, {
      name: format({ id: 'permissionManage' }),
      icon: 'settings-o',
      display: true,
      permissions: ['choerodon.code.project.develop.app-service.ps.permission.update'],
      handler: () => {
        const {
          history,
          location,
        } = props;
        history.push(`/rducm/code-lib-management/assign${location.search}&appServiceIds=${selectedAppService?.id}`);
      }
    }, {
      icon: 'refresh',
      display: true,
      handler: refresh,
    }]);
  };

  function renderName ({ value, record }) {
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

  function renderType ({ value }) {
    return value && <FormattedMessage id={`${intlPrefix}.type.${value}`} />;
  }

  function renderDate ({ value }) {
    return <TimePopover content={value} />;
  }

  function renderUrl ({ value }) {
    return (
      <a href={value} rel="nofollow me noopener noreferrer" target="_blank">
        {value ? `../${value.split('/')[value.split('/').length - 1]}` : ''}
      </a>
    );
  }

  function renderStatus ({ value: active, record }) {
    const isSynchro = record.get('synchro');
    const isFailed = record.get('fail');
    let colorCode;
    if (isSynchro) {
      if (isFailed) {
        colorCode = 'failed'
      } else if (active) {
        colorCode = 'active'
      } else {
        colorCode = 'unready'
      }
    } else {
      colorCode = 'operating'
    }
    return (
      <Tooltip title={format({ id: colorCode })}>
        <div style={{ display: 'inline-block' }}>
          <StatusTag
            colorCode={colorCode}
            style={{
              marginRight: '7px'
            }}
            name={formatMessage({ id: `c7ncd.appService.${colorCode}` })}
          />
        </div>
      </Tooltip>
    );
  }

  function renderActions ({ record }) {
    const actionData = {
      detail: {
        service: ['choerodon.code.project.develop.app-service.ps.default'],
        text: format({ id: 'Details' }),
        action: () => {
          ref?.current?.openDetail(record);
        },
      },
      edit: {
        service: ['choerodon.code.project.develop.app-service.ps.update'],
        text: format({ id: 'Modify' }),
        action: () => {
          setSelectedAppService(record.toData());
          openEdit(record.get('id'));
        },
      },
      outEdit: {
        service: ['choerodon.code.project.develop.app-service.ps.out.edit'],
        text: format({ id: 'ModifyExternal' }),
        action: () => {
          openOutEdit(record);
        },
      },
      stop: {
        service: ['choerodon.code.project.develop.app-service.ps.disable'],
        text: formatMessage({ id: 'boot.stop' }),
        action: () => {
          setSelectedAppService(record.toData());
          openStop(record);
        }
      },
      run: {
        service: ['choerodon.code.project.develop.app-service.ps.enable'],
        text: formatMessage({ id: 'boot.enable' }),
        action: () => {
          setSelectedAppService(record.toData());
          changeActive(true, record);
        },
      },
      delete: {
        service: ['choerodon.code.project.develop.app-service.ps.delete'],
        text: formatMessage({ id: 'delete' }),
        action: () => {
          setSelectedAppService(record.toData());
          handleDelete(record);
        },
      },

    };
    let actionItems;
    if (record.get('fail')) {
      actionItems = pick(actionData, ['delete', 'detail']);
    }
    else if (record.get('synchro') && record.get('active') && (record.get('type') === 'normal' && record.get('appExternalConfigDTO'))) {
      actionItems = pick(actionData, ['edit', 'stop', 'detail', 'outEdit']);
    }
    else if (record.get('synchro') && record.get('active')) {
      actionItems = pick(actionData, ['edit', 'stop', 'detail']);
    }
    else if (record.get('sagaInstanceId')) {
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

  function openCreate () {
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
      okText: formatMessage({ id: 'boot.create' }),
    });
  }

  function openEdit (id) {
    const appServiceId = id || selectedAppService.id;
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
      okText: formatMessage({ id: 'boot.save' }),
    });
  }

  function openOutEdit (record) {
    const appServiceId = record.get('id');
    const externalConfigId = record.get('externalConfigId');

    Modal.open({
      key: createModalKey,
      drawer: true,
      style: modalStyle1,
      title: '修改外置仓库配置',
      children: <CreateForm
        refresh={refresh}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        appServiceId={appServiceId}
        externalConfigId={externalConfigId}
      />,
      okText: '保存',
    });
  }

  // 因为在应用服务那边做了最近访问前端缓存，如果要删除，也必须要删除这个缓存
  function checkLocalstorage (appId) {
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

  async function handleDelete (record) {
    const appId = record.get('id');
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.delete.title` }, { name: record.get('name') }),
      children: formatMessage({ id: `${intlPrefix}.delete.des` }),
      okText: formatMessage({ id: 'delete' }),
    };
    const res = await listDs.delete(record, modalProps);
    if (res && res.success) {
      refresh();
      checkLocalstorage(appId);
    }
  }

  async function changeActive (active, record) {
    if (!active) {
      Modal.open({
        key: modalKey3,
        title: formatMessage({ id: `${intlPrefix}.stop` }, { name: listDs.current.get('name') }),
        children: <FormattedMessage id={`${intlPrefix}.stop.tips`} />,
        onOk: () => handleChangeActive(active, record),
        okText: formatMessage({ id: 'boot.stop' }),
      });
    } else {
      handleChangeActive(active, record);
    }
  }

  async function handleChangeActive (active, record) {
    try {
      if (await appServiceStore.changeActive(projectId, record.get('id'), active)) {
        checkLocalstorage(record.get('id'));
        refresh();
      } else {
        return false;
      }
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  }

  function openStop (record) {
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
          childrenContent = formatMessage({ id: 'c7ncd.appService.cannotstop.des' });
        } else if (checkResources && !checkRule) {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.resource` });
        } else if (!checkResources && checkRule) {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.rules` });
        } else {
          childrenContent = formatMessage({ id: `${intlPrefix}.has.both` });
        }

        const statusObj = {
          title: status ? formatMessage({ id: `${intlPrefix}.cannot.stop` }, { name: record.get('name') }) : formatMessage({ id: `${intlPrefix}.stop` }, { name: record.get('name') }),
          // eslint-disable-next-line no-nested-ternary
          children: childrenContent,
          okCancel: !status,
          onOk: () => (status ? stopModal.close() : handleChangeActive(false, record)),
          okText: status ? formatMessage({ id: 'iknow' }) : formatMessage({ id: 'boot.stop' }),
          cancelText: formatMessage({ id: 'c7ncd.appService.cancel' }),
          footer: ((okBtn, cancelBtn) => (
            <>
              {!status && cancelBtn}
              {okBtn}
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

  function getHeader () {
    return (
      <Header title={format({ id: 'title' })}>
        <HeaderButtons
          items={getItemsButton()}
          showClassName={false}
        />
      </Header>
    );
  }

  const renderTheme4Dom = () => {
    return (
      <div className="c7ncd-theme4-appService">
        <div className="c7ncd-theme4-appService-left">
          <Loading display={listDs.status === 'loading'} type="c7n">
            {
              listDs.records.map(record => (
                <div
                  className="c7ncd-appService-item"
                  style={{
                    background: record.get('id') === selectedAppService?.id ? 'rgba(104, 135, 232, 0.08)' : 'unset',
                  }}
                  onClick={() => {setSelectedAppService(record.toData())}}
                >
                  <div className="c7ncd-appService-item-center">
                    <div className="c7ncd-appService-item-center-line" style={{ justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title={record.get('name')}>
                          <span className="c7ncd-appService-item-center-line-name">{record.get('name')}</span>
                        </Tooltip>
                        {
                          renderStatus({ value: record.get('active'), record })
                        }
                        {(record.get('type') === 'normal' && record.get('appExternalConfigDTO')) &&
                          <span className="c7ncd-appService-item-center-line-type">
                            外置仓库
                          </span>}
                        {(record.get('type') === 'normal' && (!record.get('appExternalConfigDTO'))) &&
                          <span className="c7ncd-appService-item-center-line-in-type">
                            内置仓库
                          </span>}
                        {record.get('errorMessage') && record.get('fail') && <Tooltip overlayStyle={{ maxHeight: 500, overflow: 'auto' }} title={record.get('errorMessage')}>
                          <Icon
                            type="info"
                            style={{
                              color: '#f76776',
                              marginRight: '5px'
                            }}
                          />
                        </Tooltip>
                        }
                        <span className="c7ncd-appService-item-center-line-type">
                          <FormattedMessage id={`c7ncd.appService.${record.get('type')}`} />
                        </span>
                      </div>
                      {renderActions({ record })}
                    </div>
                    <div className="c7ncd-appService-item-center-line" style={{ justifyContent: 'flex-start' }}>
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
                    <div className="c7ncd-appService-item-center-line" style={{ justifyContent: 'flex-end' }}>
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
                    <div className="c7ncd-appService-item-center-line" style={{ justifyContent: 'flex-end' }}>
                      <span
                        className="c7ncd-appService-item-center-line-updateUserName"
                        style={{
                          backgroundImage: `url(${record.get('updateUserImage')})`
                        }}
                      >
                        {!record.get('updateUserImage') && record.get('updateUserName')?.substring(0, 1)?.toUpperCase()}
                      </span>
                      <span className="c7ncd-appService-item-center-line-gxy">{ format({ id: 'UpdateAt' }) }</span>
                      {
                        record.get('lastUpdateDate') &&
                        <TimePopover content={record.get('lastUpdateDate')} />
                      }
                      <span
                        style={{
                          marginLeft: 31,
                          backgroundImage: `url(${record.get('createUserImage')})`
                        }}
                        className="c7ncd-appService-item-center-line-updateUserName"

                      >
                        {!record.get('createUserImage') && record.get('createUserName')?.substring(0, 1)?.toUpperCase()}
                      </span>
                      <span className="c7ncd-appService-item-center-line-gxy">{ format({ id: 'CreateAt' }) }</span>
                      {
                        record.get('creationDate') &&
                        <TimePopover content={record.get('creationDate')} />
                      }
                    </div>
                  </div>
                </div>
              ))
            }
          </Loading>
          <Pagination
            dataSet={listDs}
            style={{
              marginTop: '17px',
              float: 'right',
            }}
          />
        </div>
        <div className="c7ncd-theme4-appService-divided" />
        <div className="c7ncd-theme4-appService-right">
          <ServiceDetail
            cRef={ref}
            match={{
              params: {
                id: selectedAppService?.id,
                projectId: AppState.currentMenuType.projectId,
              }
            }}
            type={selectedAppService?.type}
          />
        </div>
      </div>
    )
  }

  function handleChangeSearch (value) {
    listDs.setQueryParameter('params', value);
    listDs.query()
  }

  const { run: handleDebounceSearch } = useDebounceFn(handleChangeSearch, {
    wait: 500
  })

  return (
    <>
      {getHeader()}
      <Breadcrumb
        {
        ...AppState.getCurrentTheme === 'theme4' ? {
          extraNode: (
            <TextField
              ref={searchRef}
              className="theme4-c7n-member-search"
              placeholder={format({ id: 'searchAppService' })}
              style={{ marginLeft: 32 }}
              suffix={(
                <Icon
                    type="search"
                    onClick={() => searchRef.current.blur()}
                />
              )}
              clearButton
              onChange={handleDebounceSearch}
              valueChangeAction="input"
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
    </>
  );
}));

export default ListView;
