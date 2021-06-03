/* eslint-disable */
import React, { useEffect, Fragment, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ReactMarkdown from 'react-markdown';
import map from 'lodash/map';
import classNames from 'classnames';
import {
  Pagination, Icon, Button, Modal,
} from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Action, Page, Permission } from '@choerodon/boot';
import UserInfo from '../../../../components/userInfo';
import TimePopover from '../../../../components/timePopover';
import EmptyPage from '../../../../components/empty-page';
import Loading from '../../../../components/loading';
import { handlePromptError } from '../../../../utils';
import { useAppTagStore } from './stores';
import { useCodeManagerStore } from '../../stores';
import AppTagCreate from './modals/app-tag-create/AppTagCreate';
import AppTagEdit from './modals/app-tag-edit/index';
import NewEmptyPage from '../../components/empty-page';

import './index.less';

const { Panel } = Collapse;
const appTagCreateKey = Modal.key();
const appTagEditKey = Modal.key();
const deleteKey = Modal.key();
const bigModelStyle = {
  width: 'calc(100vw - 3.52rem)',
};
export default observer((props) => {
  const appTagStore = useAppTagStore();
  const {
    formatMessage, handleMapStore, appTagDs, projectId, tagStore, appTagCreateDs,
  } = appTagStore;
  const { appServiceDs, selectAppDs } = useCodeManagerStore();
  const appServiceId = selectAppDs.current.get('appServiceId');
  const appTagData = appTagDs.toData() || [];

  const { styles } = props;

  const getSelfToolBarObj = () => {
    return ({
      name: formatMessage({ id: 'apptag.create' }),
      icon: 'playlist_add',
      disabled: !selectAppDs.current.get('appServiceId'),
      display: true,
      permissions: ['choerodon.code.project.develop.code-management.ps.tag.create'],
      handler: openCreate,
    })
  }

  /**
   * 生成特殊的自定义tool-bar
   */
  const getSelfToolBar = () => (
    <Permission
      service={['choerodon.code.project.develop.code-management.ps.tag.create']}
    >
      <Button
        type="primary"
        funcType="flat"
        icon="playlist_add"
        onClick={openCreate}
        disabled={!selectAppDs.current.get('appServiceId')}
      >
        {formatMessage({ id: 'apptag.create' })}
      </Button>
    </Permission>
  );

  useEffect(() => {
    handleMapStore.setCodeManagerAppTag({
      refresh,
      getSelfToolBar,
      getSelfToolBarObj,
    });
  }, [getSelfToolBar]);

  function refresh() {
    appTagDs.query();
  }

  async function handleCreate() {
    const res = await appTagCreateDs.submit();
    if (!res) {
      return false;
    }
    refresh();
    appTagCreateDs.reset();
  }
  async function handleRemove(tag) {
    try {
      const res = await tagStore.deleteTag(projectId, tag, appServiceId);
      if (handlePromptError(res, false)) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * 打开删除确认框
   * @param tag
   */
  async function openRemove(tag) {
    try {
      await tagStore.checkCreate(projectId, appServiceId, 'TAG_DELETE');
      Modal.open({
        key: deleteKey,
        title: formatMessage({ id: 'apptag.action.delete.title' }, { name: tag }),
        children: formatMessage({ id: 'apptag.delete.tooltip' }),
        onOk: () => handleRemove(tag),
        okText: formatMessage({ id: 'delete' }),
        okProps: { color: 'red' },
        cancelProps: { color: 'dark' },
      });
    } catch (e) {
      // return;
    }
  }

  const openCreate = async () => {
    try {
      await tagStore.checkCreate(projectId, appServiceId);
      tagStore.queryBranchData({ projectId, appServiceId });
      const createProps = {
        appTagStore,
        tagStore,
        projectId,
        appServiceId,
      };
      Modal.open({
        key: appTagCreateKey,
        title: formatMessage({ id: 'apptag.create' }),
        children: <AppTagCreate {...createProps} />,
        drawer: true,
        style: bigModelStyle,
        okText: formatMessage({ id: 'create' }),
        onCancel: () => {
          appTagCreateDs.reset();
        },
        onOk: handleCreate,
      });
    } catch (e) {
      // return;
    }
  };

  const openEdit = (tag, release) => {
    const editProps = {
      tag,
      release,
      tagStore,
      refresh,
      projectId,
      appServiceId,
      appTagStore,
    };
    Modal.open({
      key: appTagEditKey,
      title: formatMessage({ id: 'apptag.update' }),
      children: <AppTagEdit {...editProps} />,
      drawer: true,
      style: bigModelStyle,
      okText: formatMessage({ id: 'save' }),
    });
  };

  function getTagList() {
    return (map(appTagData, (item) => {
      const {
        commit: {
          authorName,
          committedDate,
          message: commitMsg,
          shortId,
          url,
        },
        commitUserImage,
        release,
      } = item;
      const header = (
        <div className="c7n-tag-panel">
          <div className="c7n-tag-panel-info">
            <div className="c7n-tag-panel-name">
              <Icon type="local_offer" />
              <div className="c7n-tag-name">
                <span className="c7n-tag-name-text">{release.tagName}</span>
              </div>
              <div className="c7n-tag-action" onClick={stopPropagation}>
                <Action data={[
                  {
                    service: ['choerodon.code.project.develop.code-management.ps.tag.update'],
                    text: formatMessage({ id: 'edit' }),
                    action: () => { openEdit(release.tagName, release.description !== 'empty' ? release.description : formatMessage({ id: 'apptag.release.empty' })); },
                  },
                  {
                    service: [
                      // 'choerodon.code.project.develop.code-management.ps.tag.delete',
                    ],
                    text: formatMessage({ id: 'delete' }),
                    action: () => { openRemove(release.tagName); },
                  },
                ]}
                />
              </div>
            </div>
            <div className="c7n-tag-panel-detail">
              <Icon className="c7n-tag-icon-point" type="point" />
              <a href={url} rel="nofollow me noopener noreferrer" target="_blank">{shortId}</a>
              <span className="c7n-divide-point">&bull;</span>
              <span className="c7n-tag-msg">{commitMsg}</span>
              <span className="c7n-divide-point">&bull;</span>
              <span className="c7n-tag-panel-person">
                <UserInfo
                  name={authorName || ''}
                  avatar={commitUserImage}
                />
              </span>
              <span className="c7n-divide-point">&bull;</span>
              <div className="c7n-tag-time"><TimePopover content={committedDate} /></div>
            </div>
          </div>
        </div>
      );
      return (
        <Panel
          header={header}
          key={release.tagName}
        >
          <div className="c7n-tag-release">
            {release ? (
              <div className="c7n-md-parse c7n-md-preview">
                <ReactMarkdown
                  source={release.description !== 'empty' ? release.description : formatMessage({ id: 'apptag.release.empty' })}
                  skipHtml={false}
                  escapeHtml={false}
                />
              </div>
            ) : formatMessage({ id: 'apptag.release.empty' })}
          </div>
        </Panel>
      );
    }));
  }

  function getContent() {
    return (appTagData.length > 0
      ? (
        <>
          <Collapse bordered={false}>
            {getTagList()}
          </Collapse>
          <div className="c7n-tag-pagin">
            <Pagination dataSet={appTagDs} />
          </div>
        </>
      ) : (
        <EmptyPage
          title={formatMessage({ id: 'code-management.tag.empty' })}
          describe={formatMessage({ id: 'code-management.tag.empty.des' })}
          btnText={formatMessage({ id: 'apptag.create' })}
          onClick={openCreate}
          access
        />
      )
    );
  }

  return (
    <>
      <Page
        className={classNames('c7n-tag-wrapper', 'page-container', styles?.['c7n-branch-theme4-page'])}
        service={[]}
      >
        {/* 应用/标签是否加载完成的判断，目的是控制Loading的显示 */}
        {appServiceDs.status !== 'ready' || appTagDs.status !== 'ready' ? <Loading display />
          : (
            <div className="c7ncd-tag-content">
              {tagStore.getIsEmpty ? (
                <NewEmptyPage
                  title={formatMessage({ id: 'empty.title.prohibited' })}
                  describe={formatMessage({ id: 'empty.title.code' })}
                  btnText={formatMessage({ id: 'empty.link.code' })}
                  pathname="/rducm/code-lib-management/apply"
                />
              ) : getContent()}
            </div>
          )}
      </Page>
    </>
  );
});

function stopPropagation(e) {
  e.stopPropagation();
}
