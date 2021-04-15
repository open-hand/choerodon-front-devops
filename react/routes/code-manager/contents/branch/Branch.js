/* eslint-disable */
import React, { Fragment, useEffect, useState } from 'react';
import {
  Modal as ProModal, Table, Tooltip, Button, Icon,
} from 'choerodon-ui/pro';
import {
  Page, Permission, stores, Action,
} from '@choerodon/boot';
import classNames from 'classnames';
import { injectIntl, FormattedMessage } from 'react-intl';
import { SagaDetails } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import BranchCreate from './branch-create/index';
import BranchEdit from './branch-edit';
import IssueDetail from './issue-detail';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import UserInfo from '../../../../components/userInfo';
import TimePopover from '../../../../components/timePopover';
import Loading from '../../../../components/loading';
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
    projectId,
    intl,
    AppState,
    appServiceDs,
    appServiceId,
    formatMessage,
    branchStore,
  } = useTableStore();

  const { styles, columnsRender } = props;

  const [isOPERATIONS, setIsOPERATIONS] = useState(false);

  useEffect(() => {
    const pattern = new URLSearchParams(window.location.hash);
    if (pattern.get('category') === 'OPERATIONS') {
      setIsOPERATIONS(true);
    }
  }, []);

  useEffect(() => {
    handleMapStore.setCodeManagerBranch({
      refresh: handleRefresh,
      getSelfToolBar,
    });
  }, [projectId, appServiceId]);

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
        okText: <FormattedMessage id="create" />,
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
    return <span className={`c7n-branch-icon icon-${type}`}>{type.slice(0, 1).toUpperCase()}</span>;
  };

  // 打开修改问题模态框
  function openEditIssueModal(recordData) {
    const {
      issueId,
      objectVersionNumber,
      branchName,
      issueCode: issueNum,
      issueName: summary,
      typeCode,
      projectName: sourceProjectName,
      projectId: sourceProjectId,
    } = recordData || {};
    const initIssue = {
      issueId,
      issueNum,
      summary,
      typeCode,
    };
    const showDefaultIssue = issueId && issueNum && summary;
    ProModal.open({
      key: branchEditModalKey,
      title: <FormattedMessage id="branch.edit" />,
      drawer: true,
      children: <BranchEdit
        intl={intl}
        appServiceId={appServiceId}
        objectVersionNumber={objectVersionNumber}
        branchName={branchName}
        issueId={showDefaultIssue && issueId}
        initIssue={showDefaultIssue && initIssue}
        handleRefresh={handleRefresh}
        initProject={sourceProjectId ? { id: sourceProjectId, name: sourceProjectName } : null}
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
        text: formatMessage({ id: 'branch.request' }),
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
    // 分支如果是master  禁止创建合并请求 否认：会造成跳转到 gitlab，gailab页面报错的问题
    if (record.get('branchName') === 'master' || record.get('status') === 'operating') {
      return null;
    }
    return (<Action data={action} />);
  }
  // 打开删除框
  const openRemove = (name) => {
    const record = tableDs.current;
    const deleteModal = {
      title: formatMessage({ id: 'branch.action.delete.title' }, { name }),
      children: formatMessage({ id: 'branch.delete.tooltip' }),
      okText: formatMessage({ id: 'delete' }),
      okProps: { color: 'red' },
      cancelProps: { color: 'dark' },
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
            style={{ display: 'inline-block', color: 'rgba(0, 0, 0, 0.65)' }}
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
    return (
      <div>
        {record.get('typeCode') ? getOptionContent(record) : null}
        <a onClick={() => openIssueDetail(record.get('issueId'), record.get('branchName'))} role="none">
          <Tooltip
            title={text}
          >
            {record.get('issueCode')}
          </Tooltip>
        </a>
      </div>
    );
  }
  /**
   * 获取issue的options
   * @param s
   * @returns {*}
   */
  const getOptionContent = (s) => {
    let mes = '';
    let icon = '';
    let color = '';
    switch (s.get('typeCode')) {
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

  function openIssueDetail(id, name) {
    const orgId = AppState.currentMenuType.organizationId;
    const projId = AppState.currentMenuType.projectId;
    ProModal.open({
      key: issueDetailModalKey,
      title: <FormattedMessage
        id="branch.detailHead"
        values={{
          name,
        }}
      />,
      drawer: true,
      children: <IssueDetail intl={intl} projectId={projId} issueId={id} orgId={orgId} />,
      style: issueDetailModalStyle,
      okCancel: false,
      okText: <FormattedMessage id="envPl.close" />,
    });
  }

  /**
   * theme4主题 table column渲染
   */
  function theme4RenderColumn({ record, text }) {
    return (
      <div className={styles?.['c7n-branch-theme4-table-column']}>
        <div
          className={styles?.['c7n-branch-theme4-table-column-side']}
          style={{
            width: '500px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ marginRight: 30 }}>
            <div className={styles?.['c7n-branch-theme4-table-column-side-line']}>
              <Icon type="branch" />
              <span className={styles?.['c7n-branch-theme4-table-column-side-line-firstLetter']}>{ record.get('branchName').substring(0, 1).toUpperCase() }</span>
              <span className={styles?.['c7n-branch-theme4-table-column-side-line-branchName']}>{ record.get('branchName') }</span>
            </div>
            <div className={styles?.['c7n-branch-theme4-table-column-side-line']}>
              <Icon type="point" />
              <a href={record.get('commitUrl')}>{ record.get('sha').substring(0, 8) }</a>
              <span className={styles?.['c7n-branch-theme4-table-column-side-line-commitContent']}>{ record.get('commitContent') }</span>
              <img src={record.get('commitUserUrl')} alt=""/>
              <TimePopover
                content={record.get('commitDate')}
                style={{
                  color: 'rgba(15, 19, 88, 0.65)',
                }}
              />
            </div>
          </div>
          {actionRender({ record })}
        </div>
        <div
          className={styles?.['c7n-branch-theme4-table-column-side']}
        >
          <div className={styles?.['c7n-branch-theme4-table-column-side-line']}>
            <img src={record.get('createUserUrl')} alt=""/>
            <span className={styles?.['c7n-branch-theme4-table-column-side-line-userIssue']}>
              {record.get('createUserRealName')}
              <span>创建
                {
                  record.get('typeCode') && '、关联问题'
                }
              </span>
            </span>
            {
              record.get('typeCode') && issueNameRender({ record, text })
            }
          </div>
        </div>
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
      {!appServiceId || appServiceDs.status !== 'ready' ? <Loading display /> : tableBranch()}
    </Page>
  );
}
export default injectIntl(observer(Branch));
