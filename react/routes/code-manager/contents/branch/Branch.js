/* eslint-disable */
import React, { Fragment, useEffect, useState } from 'react';
import {
  Modal as ProModal, Table, Tooltip, Button, Icon,
} from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import {
  Page, Permission, stores, Action, useFormatMessage,
} from '@choerodon/master';
import classNames from 'classnames';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';
import { injectIntl, FormattedMessage } from 'react-intl';
import { SagaDetails } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import BranchCreate from './branch-create/index';
import BranchEdit from './branch-edit';
import IssueDetail from './issue-detail';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import UserInfo from '../../../../components/userInfo';
import TimePopover from '../../../../components/timePopover';
import { Loading } from '@choerodon/components';
import StatusIcon from '../../../../components/StatusIcon/StatusIcon';
import handleMapStore from '../../main-view/store/handleMapStore';
import { useTableStore } from './stores';
import EmptyPage from '../../components/empty-page';

import '../../../main.less';
import './Branch.less';
import './index.less';
import './theme4.less';

const { Column } = Table;
const branchCreateModalKey = ProModal.key();
const branchEditModalKey = ProModal.key();
const issueDetailModalKey = ProModal.key();
const branchCreateModalStyle = {
  width: 740,
};
const issueDetailModalStyle = {
  width: 1020,
};
function Branch(props) {
  const {
    tableDs,
    intl,
    AppState: { currentMenuType: { organizationId, projectId, name: currentProjectName, categories } },
    appServiceDs,
    appServiceId,
    formatMessage,
    branchStore,
    prefixCls,
  } = useTableStore();

  const { styles, columnsRender } = props;

  const format = useFormatMessage('c7ncd.codeManger');

  const [isOPERATIONS, setIsOPERATIONS] = useState(false);

  useEffect(() => {
    setIsOPERATIONS(!some(categories || [], ['code', 'N_AGILE']));
  }, [categories]);

  useEffect(() => {
    handleMapStore.setCodeManagerBranch({
      refresh: handleRefresh,
      getSelfToolBar,
      getSelfToolBarObj,
    });
  }, [projectId, appServiceId]);

  const getSelfToolBarObj = () => {
    if (!appServiceId) {
      return {};
    } else {
      return ({
        name: format({ id: 'CreateBranch' }),
        icon: 'playlist_add',
        display: true,
        permissions: ['choerodon.code.project.develop.code-management.ps.branch.create'],
        disabled: !(appServiceId && renderEmpty()),
        handler: openCreateBranchModal,
      })
    }
  };

  /**
   * 生成特殊的自定义tool-bar
   * 未选择应用那么就不显示 创建分支按钮
   * 如果是空仓库显示不可用的创建分支按钮
   * 如果是使用了过滤条 导致没有数据，那么仍然可以看到创建分支按钮
   */
  const getSelfToolBar = () => (
    !(appServiceId)
      ? null
      : (
        <Permission
          service={['choerodon.code.project.develop.code-management.ps.branch.create',
          ]}
        >
          <Button
            onClick={openCreateBranchModal}
            icon="playlist_add"
            disabled={!(appServiceId && renderEmpty())}
          >
            <FormattedMessage id="branch.create" />
          </Button>
        </Permission>
      ));

  function renderEmpty() {
    const appServiceData = appServiceDs.toData();
    if (!appServiceData) {
      return false;
    }
    const appArr = appServiceDs.current && appServiceData;
    const select = appArr.filter((item) => item?.id === appServiceId);
    return !select[0]?.emptyRepository;
  }
  // 打开创建分支模态框
  async function openCreateBranchModal() {
    try {
      await branchStore.checkCreate(projectId, appServiceId);
      ProModal.open({
        key: branchCreateModalKey,
        title: <FormattedMessage id="branch.create" />,
        drawer: true,
        children: <BranchCreate intl={intl} appServiceId={appServiceId} handleRefresh={handleRefresh} />,
        style: branchCreateModalStyle,
        okText: <FormattedMessage id="c7ncd.codeManger.Create" />,
        cancelText: <FormattedMessage id="cancel" />,
      });
    } catch (e) {
      // return
    }
  }

  /**
   * 刷新
   */
  const handleRefresh = () => {
    appServiceId && tableDs.query();
  };

  /**
   * 获取列表的icon
   * @param name 分支名称
   * @returns {*}
   */
  const getIcon = (name) => {
    const nameArr = ['feature', 'release', 'bugfix', 'hotfix'];
    let type = '';
    if (name.includes('-') && nameArr.includes(name.split('-')[0])) {
      type = name.split('-')[0];
    } else if (name === 'master') {
      type = name;
    } else {
      type = 'custom';
    }
    return <span style={{ marginLeft: 10 }} className={`c7n-branch-icon icon-${type}`}>{type.slice(0, 1).toUpperCase()}</span>;
  };

  // 打开修改问题模态框
  function openEditIssueModal(recordData) {
    const {
      objectVersionNumber,
      branchName,
      issueInfoList,
    } = recordData || {};
    const initIssues = [];
    forEach(issueInfoList || [], (issue) => {
      const { issueId, issueCode, issueName, issueProjectId, projectName, typeCode } = issue || {};
      if (issueId && issueCode && issueName) {
        initIssues.push({
          issue: {
            issueId,
            issueNum: issueCode,
            summary: issueName,
            typeCode,
          },
          project: {
            id: issueProjectId,
            name: String(issueProjectId) === String(projectId) ? currentProjectName : projectName,
          }
        })
      }
    });
    ProModal.open({
      key: branchEditModalKey,
      title: <FormattedMessage id="branch.edit" />,
      drawer: true,
      children: <BranchEdit
        intl={intl}
        appServiceId={appServiceId}
        objectVersionNumber={objectVersionNumber}
        branchName={branchName}
        handleRefresh={handleRefresh}
        initIssues={initIssues}
      />,
      style: branchCreateModalStyle,
      okText: <FormattedMessage id="save" />,
      cancelText: <FormattedMessage id="cancel" />,
    });
  }

  async function handleMergeRequest(record) {
    try {
      await branchStore.checkCreate(projectId, appServiceId, 'MERGE_REQUEST_CREATE');
      window.open(`${record.get('commitUrl').split('/commit')[0]}/merge_requests/new?change_branches=true&merge_request[source_branch]=${record.get('branchName')}&merge_request[target_branch]=master`);
    } catch (e) {
      // return
    }
  }

  function openSagaDetails(id) {
    ProModal.open({
      title: formatMessage({ id: 'global.saga-instance.detail' }),
      key: ProModal.key(),
      children: <SagaDetails sagaInstanceId={id} instance />,
      drawer: true,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
      style: {
        width: 'calc(100% - 3.5rem)',
      },
    });
  }

  // 分支名称渲染函数
  function branchNameRenderer({ record, text }) {
    const status = record.get('status');
    const errorMessage = record.get('errorMessage');
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {getIcon(text)}
        <StatusIcon
          status={status}
          error={errorMessage}
          name={text}
          width={0.17}
          clickAble={(status !== 'operating') && !isOPERATIONS}
          onClick={() => openEditIssueModal(record.toData())}
          record={text}
          permissionCode={['choerodon.code.project.develop.code-management.ps.branch.update']}
        />
        {record.get('sagaInstanceId') ? (
          <Icon
            className="c7n-branch-table-dashBoard"
            type="developer_board"
            onClick={() => openSagaDetails(record.get('sagaInstanceId'))}
          />
        ) : ''}
      </div>
    );
  }
  // 操作符渲染函数
  function actionRender({ record }) {
    const action = [
      {
        service: [
          'choerodon.code.project.develop.code-management.ps.default',
        ],
        text: format({ id: 'CreateMerge' }),
        action: () => handleMergeRequest(record),
      },
      {
        service: [
          'choerodon.code.project.develop.code-management.ps.branch.delete',
        ],
        text: formatMessage({ id: 'delete' }),
        action: () => openRemove(record.get('branchName')),
      },
    ];
    const editAction = ({
      service: ['choerodon.code.project.develop.code-management.ps.branch.update'],
      text: format({ id: 'Modify' }),
      action: () => openEditIssueModal(record.toData()),
    });
    if (!isOPERATIONS) {
      action.unshift(editAction);
    }
    // 分支如果是master  禁止创建合并请求 否则会造成跳转到 gitlab，gailab页面报错的问题
    if (record.get('status') === 'operating' || (record.get('branchName') === 'master' && isOPERATIONS)) {
      return <div style={{ width: 24 }} />;
    }
    return (
      <Action
        data={record.get('branchName') === 'master' ? [editAction] : action}
        className={`${prefixCls}-item-action`}
      />
    );
  }
  // 打开删除框
  const openRemove = (name) => {
    const record = tableDs.current;
    const deleteModal = {
      title: formatMessage({ id: 'branch.action.delete.title' }, { name }),
      children: formatMessage({ id: 'branch.delete.tooltip' }),
      okText: formatMessage({ id: 'delete' }),
    };
    tableDs.delete(record, deleteModal);
  };
  // 最新提交渲染函数
  function updateCommitRender({ record, text }) {
    return (
      <div>
        <div>
          <i className="icon icon-point branch-column-icon" />
          <a href={record.get('commitUrl')} target="_blank" rel="nofollow me noopener noreferrer">
            <span>{record.get('sha') && record.get('sha').slice(0, 8)}</span>
          </a>
          <i
            className="icon icon-schedule branch-col-icon branch-column-icon"
            style={{ paddingLeft: 16, fontSize: 16, marginBottom: 2 }}
          />
          <TimePopover
            content={record.get('commitDate')}
            style={{ display: 'inline-block', color: 'var(--text-color3)' }}
          />
        </div>
        {record.get('commitUserUrl') && record.get('commitUserName') ? (
          <Tooltip title={`${record.get('commitUserName')}${record.get('commitUserRealName') ? ` (${record.get('commitUserRealName')})` : ''}`}>
            <div className="branch-user-img" style={{ backgroundImage: `url(${record.get('commitUserUrl')})` }} />
          </Tooltip>
        ) : (
          <Tooltip title={record.get('commitUserName') ? `${record.get('commitUserName')}${record.get('commitUserRealName') ? ` (${record.get('commitUserRealName')})` : ''}` : ''}>
            <div className="branch-user-img">{record.get('commitUserName') && record.get('commitUserName').slice(0, 1)}</div>
          </Tooltip>
        )}
        <MouserOverWrapper text={text} width={0.2} className="branch-col-icon">
          {text}
        </MouserOverWrapper>
      </div>
    );
  }
  // 创建者渲染函数
  function createUserRender({ record, text }) {
    return (
      <UserInfo name={text || ''} avatar={record.get('createUserUrl')} id={record.get('createUserName')} />
    );
  }
  // 问题名称渲染函数
  function issueNameRender({ record, text }) {
    const issueContent = map(record.get('issueInfoList') || [], (issueItem, index) => {
      const { typeCode, issueId, issueProjectId, issueCode, projectName, issueName } = issueItem || {};
      return (
        <div className={`${prefixCls}-issue-item`}>
          <div className={`${prefixCls}-issue-item-title`}>
            {typeCode ? getOptionContent(typeCode) : null}
            <a
              onClick={() => openIssueDetail(issueId, record.get('branchName'), issueProjectId)}
              role="none"
              className={`${prefixCls}-issue-item-title-name`}
            >
              <Tooltip
                title={`${issueCode} ${issueName}`}
              >
                {`${issueCode} ${issueName}`}
              </Tooltip>
            </a>
          </div>
          <div className={`${prefixCls}-issue-item-project`}>
            <Icon type="project_line" className={`${prefixCls}-issue-item-project-icon`} />
            <span>{projectName}</span>
          </div>
        </div>
      );
    });
    return (
      <div className={`${prefixCls}-issue`}>
        <span className={`${prefixCls}-issue-label`}>{formatMessage({ id: 'c7ncd.codeManger.Associated' })}：</span>
        {issueContent ? issueContent[0] : null}
        {issueContent?.length > 1 ? (
          <Popover
            placement="bottom"
            content={issueContent}
            overlayClassName={`${prefixCls}-issue-popover`}
            arrowPointAtCenter
          >
            <Icon type="expand_more" className={`${prefixCls}-issue-expand`} />
          </Popover>
        ) : null}
      </div>
    )
  }
  /**
   * 获取issue的options
   * @param s
   * @returns {*}
   */
  const getOptionContent = (typeCode) => {
    let mes = '';
    let icon = '';
    let color = '';
    switch (typeCode) {
      case 'story':
        mes = formatMessage({ id: 'branch.issue.story' });
        icon = 'agile_story';
        color = '#00bfa5';
        break;
      case 'bug':
        mes = formatMessage({ id: 'branch.issue.bug' });
        icon = 'agile_fault';
        color = '#f44336';
        break;
      case 'issue_epic':
        mes = formatMessage({ id: 'branch.issue.epic' });
        icon = 'agile_epic';
        color = '#743be7';
        break;
      case 'sub_task':
        mes = formatMessage({ id: 'branch.issue.subtask' });
        icon = 'agile_subtask';
        color = '#4d90fe';
        break;
      default:
        mes = formatMessage({ id: 'branch.issue.task' });
        icon = 'agile_task';
        color = '#4d90fe';
    }
    return (
      <Tooltip title={mes}>
        <div style={{ color }} className="branch-issue"><i className={`icon icon-${icon}`} /></div>
      </Tooltip>
    );
  };

  function openIssueDetail(id, name, issueProjectId) {
    const newProjectId = issueProjectId || projectId;
    ProModal.open({
      key: issueDetailModalKey,
      title: <FormattedMessage
        id="branch.detailHead"
        values={{
          name,
        }}
      />,
      drawer: true,
      children: <IssueDetail intl={intl} projectId={newProjectId} issueId={id} orgId={organizationId} />,
      style: issueDetailModalStyle,
      okCancel: false,
      okText: <FormattedMessage id="envPl.close" />,
    });
  }

  /**
   * theme4主题 table column渲染
   */
  function theme4RenderColumn({ record, text }) {
    const status = record.get('status');
    const errorMessage = record.get('errorMessage');
    return (
      <div className={styles?.['c7n-branch-theme4-table-column']}>
        <div
          className={styles?.['c7n-branch-theme4-table-column-side']}
          style={{
            width: '600px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          <div style={{ marginRight: 30 }}>
            <div className={styles?.['c7n-branch-theme4-table-column-side-line']}>
              <Icon type="branch" />
              {getIcon(record.get('branchName'))}
              <StatusIcon
                status={status}
                error={errorMessage}
                name={record.get('branchName')}
                width={0.17}
                record={record.get('branchName')}
                className={`${prefixCls}-item-branchName`}
              />
            </div>
            <div className={styles?.['c7n-branch-theme4-table-column-side-line']}>
              <Icon type="point" />
              <a href={record.get('commitUrl')}>{record.get('sha')?.substring(0, 8)}</a>
              {record.get('commitUserRealName') && (
                <UserInfo
                  name={record.get('commitUserRealName')}
                  id={record.get('commitUserName')}
                  avatar={record.get('commitUserUrl')}
                  showName={false}
                />
              )}
              <span className={styles?.['c7n-branch-theme4-table-column-side-line-commitContent']}>{record.get('commitContent')}&nbsp;·&nbsp;</span>
              <UserInfo
                name={record.get('createUserRealName')}
                id={record.get('createUserName')}
                avatar={record.get('createUserUrl')}
                showName={false}
              />
              <span>{formatMessage({ id: 'c7ncd.codeManger.Createat' })}</span>
              <TimePopover content={record.get('creationDate')} />
            </div>
          </div>
        </div>
        {actionRender({ record })}
        {
          !isEmpty(record.get('issueInfoList')) && issueNameRender({ record, text })
        }
      </div>
    )
  }

  // 获取分支正文列表
  function tableBranch() {
    if (branchStore.getIsEmpty) {
      return (
        <EmptyPage
          title={formatMessage({ id: 'empty.title.prohibited' })}
          describe={formatMessage({ id: 'empty.title.code' })}
          btnText={formatMessage({ id: 'empty.link.code' })}
          pathname="/rducm/code-lib-management/apply"
        />
      );
    }
    return (
      <div className="c7ncd-tab-table">
        <Table
          className={classNames('c7n-branch-main-table', styles?.['c7n-branch-theme4-table'])} queryBar="bar" dataSet={tableDs}
        >
          {columnsRender({
            branchNameRenderer,
            actionRender,
            updateCommitRender,
            createUserRender,
            isOPERATIONS,
            issueNameRender,
            theme4RenderColumn,
          })}
        </Table>
      </div>
    );
  }

  return (
    <Page
      className={classNames('c7n-region c7n-branch', styles?.['c7n-branch-theme4-page'])}
      service={['choerodon.code.project.develop.code-management.ps.branch.create']}
    >
      {appServiceDs.status !== 'ready' ? <Loading display type="c7n" /> : tableBranch()}
          </Page>
  );
}
export default injectIntl(observer(Branch));

