/* eslint-disable max-len */
import React, {
  useRef, Suspense,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Header, Breadcrumb, Content, HeaderButtons, useFormatMessage,
} from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';
import { useSessionStorageState } from 'ahooks';
import { useHistory, useLocation } from 'react-router';
import { OverflowWrap } from '@choerodon/components';
import PipelineTree from './components/PipelineTree';
import PipelineFlow from './components/PipelineFlow';
import DragBar from '@/components/drag-bar';
import PipelineCreate from './components/PipelineCreate';
import RecordDetail from './components/record-detail';
import EmptyPage from '@/components/empty-page';
import { usePipelineManageStore } from './stores';
import VariableSettings from './components/variable-settings';
import AuditModal from './components/audit-modal';
import GitlabRunner from './components/gitlab-runner';
import { usePipelineCreateModal } from './components/pipeline-create-modal';
import { PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY } from '@/routes/app-pipeline/stores/CONSTANTS';

import './index.less';

const recordDetailKey = Modal.key();
const settingsKey = Modal.key();
const auditKey = Modal.key();
const runnerKey = Modal.key();
const modalStyle = {
  width: 380,
};
const settingsModalStyle = {
  width: 740,
};

const PipelineManage = observer(() => {
  const {
    intl: { formatMessage },
    intlPrefix,
    prefixCls,
    permissions,
    mainStore,
    editBlockStore,
    detailStore,
    treeDs,
    projectId,
  } = usePipelineManageStore();

  const format = useFormatMessage('c7ncd.pipelineManage');
  const [, setPipelineCreateData] = useSessionStorageState(PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY);

  const {
    getMainData, loadData,
  } = editBlockStore;

  const {
    loadDetailData, getDetailData,
  } = detailStore;

  const history = useHistory();
  const {
    pathname,
    search,
  } = useLocation();

  const handleModalOpen = usePipelineCreateModal();

  const handleCreatePipeline = () => {
    Modal.open({
      key: Modal.key(),
      title: '创建流水线',
      style: {
        width: 'calc(100vw - 3.52rem)',
      },
      drawer: true,
      children: <PipelineCreate
        mathRandom={Math.random()}
        refreshTree={handleRefresh}
        editBlockStore={editBlockStore}
        mainStore={mainStore}
      />,
      okText: '创建',
    });
  };

  const rootRef = useRef(null);

  const { getSelectedMenu } = mainStore;

  const handleRefresh = async () => {
    mainStore.setLoadedKeys([]);
    mainStore.setTreeDataPage(1);
    await treeDs.query();
    const { id } = getMainData;
    const { parentId } = getSelectedMenu;
    const { devopsPipelineRecordRelId } = getDetailData;
    if (!parentId) {
      id && loadData(projectId, id);
    } else {
      devopsPipelineRecordRelId && loadDetailData(projectId, devopsPipelineRecordRelId);
    }
  };

  function handleModify() {
    const {
      id, appServiceCode, appServiceId, appServiceName, name,
    } = getMainData || {};
    setPipelineCreateData({
      pipelineId: id,
      pipelineName: name,
      appService: {
        appServiceCode, appServiceId, appServiceName,
      },
    });
    history.push({
      search,
      pathname: `${pathname}/edit/edit/${id}`,
    });
  }

  function openRecordDetail() {
    const { devopsPipelineRecordRelId } = getSelectedMenu;
    const { devopsPipelineRecordRelId: detailDevopsPipelineRecordRelId, viewId } = getDetailData;
    const newDevopsPipelineRecordRelId = devopsPipelineRecordRelId || detailDevopsPipelineRecordRelId;
    Modal.open({
      key: recordDetailKey,
      style: modalStyle,
      title: (
        <span className={`${prefixCls}-detail-modal-title`}>
          流水线记录“
          <OverflowWrap width="100px">
            {`#${viewId}`}
          </OverflowWrap>
          ”的详情
        </span>
      ),
      children: <RecordDetail
        pipelineRecordId={newDevopsPipelineRecordRelId}
        intlPrefix={intlPrefix}
        refresh={handleRefresh}
        store={mainStore}
      />,
      drawer: true,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
  }

  async function changeRecordExecute(type) {
    const { gitlabProjectId, gitlabPipelineId, devopsPipelineRecordRelId } = getSelectedMenu;
    const {
      gitlabProjectId: detailGitlabProjectId,
      gitlabPipelineId: detailGitlabPipelineId,
      devopsPipelineRecordRelId: detailDevopsPipelineRecordRelId,
    } = getDetailData;
    const res = await mainStore.changeRecordExecute({
      projectId,
      gitlabProjectId: gitlabProjectId || detailGitlabProjectId,
      recordId: gitlabPipelineId || detailGitlabPipelineId,
      type,
      devopsPipelineRecordRelId: devopsPipelineRecordRelId || detailDevopsPipelineRecordRelId,
    });
    if (res) {
      handleRefresh();
    }
  }

  function openAuditModal() {
    const { devopsCdPipelineDeatilVO } = getSelectedMenu;
    const {
      cdRecordId,
      devopsCdPipelineDeatilVO: detailDevopsCdPipelineDeatilVO,
      pipelineName,
    } = getDetailData;
    Modal.open({
      key: auditKey,
      title: formatMessage({ id: `${intlPrefix}.execute.audit` }),
      children: <AuditModal
        cdRecordId={cdRecordId}
        name={pipelineName}
        mainStore={mainStore}
        onClose={handleRefresh}
        checkData={devopsCdPipelineDeatilVO || detailDevopsCdPipelineDeatilVO}
      />,
      movable: false,
    });
  }

  function openSettingsModal(type) {
    const { appServiceId, appServiceName } = getSelectedMenu;
    Modal.open({
      key: settingsKey,
      style: settingsModalStyle,
      title: formatMessage({ id: `${intlPrefix}.settings.${type}` }),
      children: <VariableSettings
        intlPrefix={intlPrefix}
        appServiceId={type === 'global' ? null : appServiceId}
        appServiceName={type === 'global' ? null : appServiceName}
        store={mainStore}
        refresh={handleRefresh}
      />,
      drawer: true,
      okText: formatMessage({ id: 'boot.save' }),
    });
  }

  function openRunnerModal() {
    Modal.open({
      key: runnerKey,
      style: settingsModalStyle,
      // title: formatMessage({ id: `${intlPrefix}.gitlab.runner` }),
      title: '注册 Gitlab Group Runner 指引',
      children: <GitlabRunner />,
      drawer: true,
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
  }

  function getHeaderButtons() {
    const { parentId, status, devopsCdPipelineDeatilVO } = getSelectedMenu;
    const {
      status: detailStatus,
      devopsCdPipelineDeatilVO: detailDevopsCdPipelineDeatilVO,
    } = getDetailData;
    const buttons = [{
      // 'choerodon.code.project.develop.ci-pipeline.ps.create'
      permissions: [],
      name: format({ id: 'CreatePipeline' }),
      icon: 'playlist_add',
      handler: handleModalOpen,
    }, {
      permissions: ['choerodon.code.project.develop.ci-pipeline.ps.variable.project'],
      name: format({ id: 'GlobalCI' }),
      icon: 'settings-o',
      handler: () => openSettingsModal('global'),
      display: true,
    }, {
      name: format({ id: 'MoreActions' }),
      groupBtnItems: [
        {
          name: format({ id: 'GitLabRunner' }),
          service: ['choerodon.code.project.develop.ci-pipeline.ps.runner'],
          handler: openRunnerModal,
        },
      ],
    },
    ];
    if (treeDs.length && treeDs.status === 'ready') {
      if (!parentId) {
        buttons.push({
          // permissions: ['choerodon.code.project.develop.ci-pipeline.ps.update'],
          name: format({ id: 'Modify' }),
          icon: 'edit-o',
          handler: handleModify,
        }, {
          permissions: ['choerodon.code.project.develop.ci-pipeline.ps.variable.app'],
          name: format({ id: 'CIVariable' }),
          icon: 'settings-o',
          handler: () => openSettingsModal('local'),
        });
      } else {
        const newStatus = status || detailStatus;
        const newDevopsCdPipelineDeatilVO = devopsCdPipelineDeatilVO || detailDevopsCdPipelineDeatilVO;
        buttons.push({
          name: format({ id: 'RecordDetails' }),
          icon: 'find_in_page-o',
          handler: openRecordDetail,
        }, {
          permissions: ['choerodon.code.project.develop.ci-pipeline.ps.cancel'],
          name: format({ id: 'CancelExecution' }),
          icon: 'power_settings_new',
          handler: () => changeRecordExecute('cancel'),
          display: newStatus === 'pending' || newStatus === 'running',
        }, {
          permissions: ['choerodon.code.project.develop.ci-pipeline.ps.retry'],
          name: format({ id: 'Retry' }),
          icon: 'refresh',
          handler: () => changeRecordExecute('retry'),
          display: newStatus === 'failed' || newStatus === 'canceled',
        }, {
          permissions: ['choerodon.code.project.develop.ci-pipeline.ps.audit'],
          name: formatMessage({ id: `${intlPrefix}.execute.audit` }),
          icon: 'authorize',
          handler: openAuditModal,
          display: newStatus === 'not_audit' && newDevopsCdPipelineDeatilVO && newDevopsCdPipelineDeatilVO.execute,
        });
      }
    }
    buttons.push({
      icon: 'refresh',
      handler: handleRefresh,
    });
    return buttons;
  }

  return (
    <Page service={permissions} className="pipelineManage_page">
      <Header title="流水线">
        <HeaderButtons items={getHeaderButtons()} showClassName={false} />
      </Header>
      <Breadcrumb />
      <Content className={`${prefixCls}-content`}>
        {!treeDs.length && treeDs.status === 'ready' && !mainStore.getSearchValue ? (
          <div className={`${prefixCls}-wrap`}>
            <Suspense fallback={<span />}>
              <EmptyPage
                title={formatMessage({ id: 'empty.title.pipeline' })}
                describe={formatMessage({ id: 'empty.tips.pipeline.owner' })}
                btnText={formatMessage({ id: `${intlPrefix}.create` })}
                onClick={handleCreatePipeline}
                access
              />
            </Suspense>
          </div>
        ) : (
          <div
            ref={rootRef}
            className={`${prefixCls}-wrap`}
          >
            <DragBar
              parentRef={rootRef}
              store={mainStore}
            />
            <PipelineTree handleRefresh={handleRefresh} />
            <div className={`${prefixCls}-main ${prefixCls}-animate`}>
              <PipelineFlow
                handleRefresh={handleRefresh}
              />
            </div>
          </div>
        )}
      </Content>
    </Page>
  );
});

export default PipelineManage;
