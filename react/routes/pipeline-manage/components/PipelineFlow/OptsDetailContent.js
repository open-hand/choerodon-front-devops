/* eslint-disable max-len */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import DetailHeader from './components/detailHeader';
import DetailColumn from './components/detailColumn';
import Loading from '../../../../components/loading';
import EmptyPage from '../../../../components/empty-page';
import { usePipelineManageStore } from '../../stores';
import { usePipelineFlowStore } from './stores';

export default observer((props) => {
  const {
    intl: { formatMessage },
    intlPrefix,
    mainStore,
    history,
    location,
    detailStore,
    projectId,
    treeDs,
  } = usePipelineManageStore();

  const {
    getSelectedMenu,
    handleRefresh,
  } = usePipelineFlowStore();

  const {
    status: treeStatus,
    stageRecordVOS: treeStageRecordVOList,
    devopsPipelineRecordRelId,
    viewId,
  } = getSelectedMenu;

  const {
    loadDetailData,
    getDetailLoading,
    getDetailData,
  } = detailStore;

  useEffect(() => {
    devopsPipelineRecordRelId && loadDetailData(projectId, devopsPipelineRecordRelId);
  }, [projectId, devopsPipelineRecordRelId]);

  // stageRecordVOS: 各个详情阶段记录,包括ci和cd的
  // devopsCipiplineVO: 本流水线记录得信息

  const {
    stageRecordVOS,
    ciCdPipelineVO,
    status,
    gitlabPipelineId: pipelineRecordId,
    gitlabTriggerRef,
    commit,
    devopsPipelineRecordRelId: recordDevopsPipelineRecordRelId,
    cdRecordId,
    viewId: loadViewId,
  } = getDetailData;

  useEffect(() => {
    const treeStatusList = map(treeStageRecordVOList || [], 'status');
    const detailStatusList = map(stageRecordVOS || [], 'status');
    const treeIsEqual = status !== treeStatus || !isEqual(detailStatusList, treeStatusList);
    if (devopsPipelineRecordRelId === recordDevopsPipelineRecordRelId && (treeIsEqual)) {
      mainStore.setTreeDataPage(1);
      mainStore.setLoadedKeys([]);
      treeDs && treeDs.query();
    }
  }, [pipelineRecordId]);

  const renderStage = () => (
    stageRecordVOS && stageRecordVOS.length > 0 ? stageRecordVOS.map((item) => {
      const {
        name, status: stageStatus, durationSeconds, sequence, type, jobRecordVOList, stageId,
      } = item;
      return (
        <DetailColumn
          key={sequence}
          piplineStageName={name}
          stageSeconds={durationSeconds}
          piplineStageStatus={stageStatus}
          history={history}
          location={location}
          handleRefresh={handleRefresh}
          stageType={type}
          jobRecordVOList={jobRecordVOList}
          stageId={stageId}
          cdRecordId={cdRecordId}
          viewId={viewId || loadViewId}
          gitlabPipelineId={pipelineRecordId}
        />
      );
    }) : (
      <EmptyPage
        title={formatMessage({ id: status === 'skipped' ? `${intlPrefix}.record.empty.title` : `${intlPrefix}.record.empty.title.other` })}
        describe={formatMessage({ id: status === 'skipped' ? `${intlPrefix}.record.empty.des` : `${intlPrefix}.record.empty.des.other` })}
        access
      />
    )
  );

  return (
    !getDetailLoading
      ? (
        <div className="c7n-piplineManage">
          <DetailHeader
            viewId={viewId || loadViewId}
            appServiceName={ciCdPipelineVO && ciCdPipelineVO.appServiceName}
            appServiceId={ciCdPipelineVO && ciCdPipelineVO.appServiceId}
            aHref={commit && commit.gitlabProjectUrl}
            triggerRef={gitlabTriggerRef}
            status={status}
            mainStore={mainStore}
            projectId={projectId}
          />
          <div className="c7n-piplineManage-detail">
            {renderStage()}
          </div>
        </div>
      ) : <Loading display={getDetailLoading} />
  );
});
