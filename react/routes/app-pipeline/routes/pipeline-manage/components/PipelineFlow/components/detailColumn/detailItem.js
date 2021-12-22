/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Tooltip } from 'choerodon-ui';
import { Modal, message } from 'choerodon-ui/pro';
import {
  WritableStream,
} from 'web-streams-polyfill/ponyfill';
import {
  Choerodon, Action, useFormatMessage,
} from '@choerodon/master';
import copy from 'copy-to-clipboard';
import StreamSaver from 'streamsaver';
import { Base64 } from 'js-base64';
import { get } from 'lodash';
import renderDuration from '@/utils/getDuration';
import { handlePromptError } from '@/utils';
import { MIDDLE } from '@/utils/getModalWidth';
import StatusTag from '../StatusTag';
import StatusDot from '../statusDot';
import CodeQuality from '../codeQuality';
import CodeLog from '../codeLog';
import { usePipelineManageStore } from '../../../../stores';
import MirrorScanning from '../MirrorScanningLog';
import jobTypesMappings from '../../../../stores/jobsTypeMappings';

const DetailItem = (props) => {
  const {
    detailStore: {
      retryJob,
      getDetailData,
      retryCdJob, // retryCdJob是部署类型任务的重试
      executeCustomJob, // 自定义类型任务，manual状态时的执行操作
    },
    projectId,
  } = usePipelineManageStore();

  const format = useFormatMessage('c7ncd.pipelineManage');

  const {
    jobDurationSeconds,
    jobStatus,
    startedDate,
    finishedDate,
    itemType,
    gitlabJobId,
    jobName,
    handleRefresh,
    cdAuto, // cd阶段job独有的
    audit, // cd阶段job独有的
    stageId, // cd阶段job独有的
    cdRecordId, // cd阶段job独有的
    stageRecordId,
    jobRecordId,
    history,
    location: { search },
    countersigned,
    chartVersion,
    sonarScannerType,
    codeCoverage,
    apiTestTaskRecordVO, // api测试任务独有的
    externalApprovalJobVO,
    viewId,
    downloadMavenJarVO,
    downloadImage,
    gitlabPipelineId,
    imageScan, // 是否显示镜像的扫描报告btn
  } = props;

  const { gitlabProjectId, appServiceId } = getDetailData && getDetailData.ciCdPipelineVO;

  function openDescModal(typeItem) {
    Modal.open({
      title: '查看日志',
      key: Modal.key(),
      style: {
        width: 'calc(100vw - 3.52rem)',
      },
      children: (
        <CodeLog
          type={typeItem}
          jobName={jobName}
          appServiceId={appServiceId}
          gitlabProjectId={gitlabProjectId}
          projectId={projectId}
          gitlabJobId={gitlabJobId}
          cdRecordId={cdRecordId}
          stageRecordId={stageRecordId}
          jobRecordId={jobRecordId}
          viewId={viewId}
        />
      ),
      drawer: true,
      okText: '关闭',
      footer: (okbtn) => <>{okbtn}</>,
    });
  }

  function openCodequalityModal() {
    Modal.open({
      title: '代码质量',
      key: Modal.key(),
      style: {
        width: 'calc(100vw - 3.52rem)',
      },
      children: <CodeQuality appServiceId={appServiceId} />,
      drawer: true,
      okText: '关闭',
      footer: (okbtn) => <>{okbtn}</>,
    });
  }

  async function handleJobRetry() {
    try {
      const res = await retryJob(projectId, gitlabProjectId, gitlabJobId, appServiceId);
      if (handlePromptError(res)) {
        handleRefresh();
        return true;
      }
      return false;
    } catch (error) {
      Choerodon.handleResponseError(error);
      return false;
    }
  }
  async function handleCdJobRetry() {
    try {
      const res = await retryCdJob(projectId, cdRecordId);
      if (handlePromptError(res)) {
        handleRefresh();
        return true;
      }
      return false;
    } catch (error) {
      Choerodon.handleResponseError(error);
      return false;
    }
  }

  function linkToAppDetailsInAppCenter({
    appId,
    chartSource,
    rdupmType,
    deployType = 'env',
    deployTypeId,
  }) {
    if (appId) {
      history.push({
        pathname: `/devops/application-center/detail/${appId}/${chartSource}/${deployType}/${deployTypeId}/${rdupmType}`,
        search: `${search}`,
      });
    } else {
      message.error('appId is not exist');
    }
  }

  const renderCdDeployment = () => {
    const {
      envName,
      appId,
      chartSource,
      rdupmType,

      deployType,
      deployTypeId,
    } = cdAuto || {};

    const verisonName = (jobStatus !== 'created' && cdAuto?.appName) || '-';

    return (
      <main>
        <div>
          <span>部署环境:</span>
          <span>{envName || '-'}</span>
        </div>
        <div>
          <span>生成应用:</span>
          <Tooltip title={cdAuto?.appName}>
            {appId ? (
              <span
                style={{ color: '#3F51B5', cursor: 'pointer' }}
                onClick={() => linkToAppDetailsInAppCenter({
                  appId,
                  chartSource,
                  rdupmType,
                  deployType,
                  deployTypeId,
                })}
              >
                {verisonName}
              </span>
            ) : <span>{verisonName}</span>}
          </Tooltip>
        </div>
      </main>
    );
  };

  const renderCdHost = () => {
    const {
      appId,
      chartSource,
      rdupmType,

      deployType,
      deployTypeId,
      appName,

      hostName,
    } = cdAuto || {};

    return (
      <main>
        <div>
          <span>主机名称：</span>
          <span>{hostName || '-'}</span>
        </div>
        <div>
          <span>制品类型：</span>
          <span>{rdupmType === 'other_group' ? '其他制品' : 'jar包'}</span>
        </div>
        <div>
          <span>生成应用:</span>
          <Tooltip title={appName}>
            <span
              style={{ color: '#3F51B5', cursor: 'pointer' }}
              onClick={() => linkToAppDetailsInAppCenter({
                appId,
                chartSource,
                rdupmType,
                deployType,
                deployTypeId,
              })}
            >
              {(jobStatus !== 'created' && appName) || '-'}
            </span>
          </Tooltip>
        </div>
      </main>
    );
  };

  const renderCdChart = () => {
    const {
      envName,
      appServiceName: cdJobAppServiceName,
      appServiceVersion: cdJobAppServiceVersion,

      appId,
      appName,
      chartSource,
      rdupmType,

      deployType,
      deployTypeId,
    } = cdAuto || {};

    return (
      <main>
        <div>
          <span>部署环境:</span>
          <span>{envName || '-'}</span>
        </div>
        <div>
          <span>应用服务:</span>
          <span>{cdJobAppServiceName || '-'}</span>
        </div>
        <div>
          <span>服务版本:</span>
          <Tooltip title={cdJobAppServiceVersion}>
            <span>{cdJobAppServiceVersion || '-'}</span>
          </Tooltip>
        </div>
        <div>
          <span>生成应用:</span>
          <Tooltip title={appName}>
            <span
              style={{ color: '#3F51B5', cursor: 'pointer' }}
              onClick={() => linkToAppDetailsInAppCenter({
                appId,
                chartSource,
                rdupmType,
                deployType,
                deployTypeId,
              })}
            >
              {(jobStatus !== 'created' && appName) || '-'}
            </span>
          </Tooltip>
        </div>
      </main>
    );
  };

  const renderCdAudit = () => {
    const { appointUsers, reviewedUsers, status: auditJobStatus } = audit || {};
    const appontUserString = appointUsers && appointUsers.map((x) => x.realName).join('，');
    const reviewedUserStirng = reviewedUsers && reviewedUsers.map((x) => x.realName).join('，');
    const countersignedText = countersigned ? '会签' : '或签';
    const countersignedNullText = countersigned === null ? '-' : countersignedText;
    return (
      <main>
        <div>
          <span>审核模式:</span>
          <span>{countersignedNullText}</span>
        </div>
        <div>
          <span>指定审核人员:</span>
          <Tooltip title={appontUserString}>
            <span>{appontUserString || '-'}</span>
          </Tooltip>
        </div>
        <div>
          <span>已审核人员:</span>
          <Tooltip title={reviewedUserStirng}>
            <span>{reviewedUserStirng || '-'}</span>
          </Tooltip>
        </div>
        <div>
          <span>审核状态:</span>
          <StatusTag status={auditJobStatus} />
        </div>
      </main>
    );
  };

  const renderChart = () => (
    <main>
      <div>
        <span>生成版本:</span>
        <Tooltip title={chartVersion}>
          <span>{chartVersion || '-'}</span>
        </Tooltip>
      </div>
    </main>
  );

  function calcValue(successCount, failCount) {
    const sum = failCount + successCount;
    if (sum) {
      const value = (successCount / sum) * 100;
      return `${Number(value.toFixed(2))}%`;
    }
    return '-';
  }

  const renderApiTest = () => {
    const {
      successCount,
      failCount,
      deployJobName,
      performThreshold,
    } = apiTestTaskRecordVO || {};

    return (
      <main>
        <div>
          <span>阈值:</span>
          <span>{performThreshold ? `${performThreshold}%` : '未设置'}</span>
        </div>
        <div>
          <span>通过率:</span>
          <span>{(successCount || successCount === 0) ? calcValue(successCount, failCount) : '-'}</span>
        </div>
        <div>
          <span>成功数量:</span>
          <span>{successCount === 0 ? '0' : successCount || '-'}</span>
        </div>
        <div>
          <span>失败数量:</span>
          <span>{failCount === 0 ? '0' : failCount || '-'}</span>
        </div>
        <div>
          <span>关联部署任务:</span>
          <span>{deployJobName || '-'}</span>
        </div>
      </main>
    );
  };

  const renderSonar = () => (
    <main>
      <div>
        <span>检查类型:</span>
        <span>{sonarScannerType}</span>
      </div>
      <div>
        <span>单测覆盖率:</span>
        <span>{codeCoverage ? `${codeCoverage}%` : '-'}</span>
      </div>
    </main>
  );

  function getRetryBtnDisabled() {
    const successAndFailed = jobStatus === 'success' || jobStatus === 'failed';
    if (itemType?.indexOf('cd') !== -1 && jobStatus === 'success') {
      return true;
    }
    return !(successAndFailed || jobStatus === 'canceled');
  }

  function goToApiTest() {
    const id = apiTestTaskRecordVO.get('id'); // 记录id
    const taskId = apiTestTaskRecordVO.get('taskId'); // 任务id
    if (id && taskId) {
      history.push({
        pathname: '/testManager/test-task',
        search,
        state: {
          taskId,
          recordId: id,
          type: 'task',
        },
      });
    } else {
      history.push(`/testManager/test-task${search}`);
    }
  }

  const renderCdExternalApproval = () => (
    <main>
      <div>
        <span>外部地址:</span>
        <Tooltip title={externalApprovalJobVO?.triggerUrl}>
          <span>{externalApprovalJobVO?.triggerUrl || '-'}</span>
        </Tooltip>
      </div>
    </main>
  );

  const renderItemDetail = () => {
    const funcMap = new Map([
      ['cdDeploy', renderCdChart],
      ['cdDeployment', renderCdDeployment],
      ['cdAudit', renderCdAudit],
      ['chart', renderChart],
      ['cdHost', renderCdHost],
      ['sonar', renderSonar],
      ['cdApiTest', renderApiTest],
      ['cdExternalApproval', renderCdExternalApproval],
    ]);
    return funcMap.get(itemType) && funcMap.get(itemType)();
  };

  const renderCheckLogFun = () => {
    openDescModal(itemType);
  };

  const logCheckDisabeldCondition = jobStatus === 'created';

  const renderRetryBtnFn = ['cdDeploy', 'cdHost', 'cdAudit', 'cdExternalApproval'].includes(itemType)
    ? handleCdJobRetry
    : handleJobRetry;

  const handleFileDownLoad = async (url, username, password, filename) => {
    const tempHeader = new Headers();
    tempHeader.append('Authorization', `Basic ${Base64.encode(`${username}:${password}`)}`);
    fetch(`${url}`, {
      method: 'GET',
      headers: tempHeader,
      mode: 'cors',
    })
      .then((response) => {
        if (!window.WritableStream) {
          StreamSaver.WritableStream = WritableStream;
          window.WritableStream = WritableStream;
        }
        const fileStream = StreamSaver.createWriteStream(filename, {
          writableStrategy: true,
          readableStrategy: true,
        });
        const readableStream = response.body;
        if (window.WritableStream && readableStream?.pipeTo) {
          return readableStream.pipeTo(fileStream).then(() => {
            message.success('下载成功');
          });
        }

        const writer = fileStream.getWriter();
        window.writer = writer;

        const reader = response.body.getReader();
        const pump = () => reader.read()
          .then((res) => (res.done
            ? writer.close()
            : writer.write(res.value).then(pump)));
        pump();
        // message.success('下载成功');
        return true;
      }).catch((error) => {
        throw new Error(error);
      });
  };

  const handleJarDownload = () => {
    const jarUrl = get(downloadMavenJarVO, 'downloaJar');
    const server = get(downloadMavenJarVO, 'server');
    const password = get(server, 'password');
    const username = get(server, 'username');
    Modal.open({
      title: '下载jar包',
      children: '确定要下载此次构建任务产生的jar包吗？',
      okText: '下载',
      onOk: () => handleFileDownLoad(jarUrl, username, password, jarUrl.split('/')[jarUrl.split('/').length - 1]),
    });
  };

  const handleImageCopy = () => {
    copy(downloadImage);
    message.success('复制成功');
  };

  const openMirrorScanningLog = () => {
    Modal.open({
      title: '查看镜像扫描报告',
      key: Modal.key(),
      children: <MirrorScanning gitlabPipelineId={gitlabPipelineId} />,
      style: {
        width: MIDDLE,
      },
      drawer: true,
      okCancel: false,
      okText: '关闭',
    });
  };

  // 自定义任务manual状态时的执行操作
  async function handleExecute() {
    try {
      const res = await executeCustomJob(projectId, gitlabProjectId, gitlabJobId, appServiceId);
      if (handlePromptError(res)) {
        handleRefresh();
        return true;
      }
      return false;
    } catch (error) {
      Choerodon.handleResponseError(error);
      return false;
    }
  }

  const renderFooterBtns = () => {
    if (jobStatus === 'created') {
      return null;
    }
    const data = [];
    if (!['cdAudit', 'cdApiTest'].includes(itemType)) {
      if (!logCheckDisabeldCondition) {
        data.push({
          service: ['choerodon.code.project.develop.ci-pipeline.ps.job.log'],
          text: format({ id: 'ViewLog' }),
          action: renderCheckLogFun,
        });
      }
      if (!getRetryBtnDisabled()) {
        data.push({
          service: ['choerodon.code.project.develop.ci-pipeline.ps.job.retry'],
          text: format({ id: 'Retry' }),
          action: renderRetryBtnFn,
        });
      }
    }
    if (itemType === 'build') {
      downloadMavenJarVO && data.push({
        service: [],
        text: 'jar包下载',
        action: handleJarDownload,
      });
      if (imageScan && jobStatus === 'success') {
        data.push({
          service: ['choerodon.code.project.develop.ci-pipeline.ps.job.imageReport'],
          text: format({ id: 'ScanReport' }),
          action: openMirrorScanningLog,
        });
      }
      // 目前先不做npm代码保留着
      // if (downloadNpm) {
      //   data.push({
      //     service: [],
      //     text: 'npm下载',
      //     action: handleNpmDownload,
      //     // disabled: getRetryBtnDisabled(),
      //   });
      // }
      downloadImage && data.push({
        service: [],
        text: format({ id: 'CopyAddress' }),
        action: handleImageCopy,
      });
    }

    if (itemType === 'sonar') {
      data.push({
        service: ['choerodon.code.project.develop.ci-pipeline.ps.job.sonarqube'],
        text: format({ id: 'QualityReport' }),
        action: openCodequalityModal,
      });
    }
    if (itemType === 'cdApiTest' && ['success', 'failed'].includes(jobStatus)) {
      data.push({
        text: '查看详情',
        service: [],
        action: goToApiTest,
      });
    }
    if (itemType === 'custom' && jobStatus === 'manual') {
      data.push({
        text: '执行',
        service: ['choerodon.code.project.develop.ci-pipeline.ps.job.execute'],
        action: handleExecute,
      });
    }
    return (
      data.length ? <Action data={data} /> : ''
    );
  };

  return (
    <div className="c7n-piplineManage-detail-column-item">
      <header>
        <StatusDot
          size={13}
          status={jobStatus}
          style={{ lineHeight: '22px' }}
        />
        <div className="c7n-piplineManage-detail-column-item-sub">
          <Tooltip title={jobName}>
            <span>
              {itemType && `【${jobTypesMappings[itemType]}】`}
              {jobName}
            </span>
          </Tooltip>
          {startedDate && finishedDate && (
            <Tooltip title={`${startedDate}-${finishedDate}`}>
              <span>
                {startedDate}
                -
                {finishedDate}
              </span>
            </Tooltip>
          )}
        </div>
      </header>
      {renderItemDetail()}
      <footer>
        {renderFooterBtns()}
        <span className="c7n-piplineManage-detail-column-item-time">
          <span>任务耗时：</span>
          <span>
            {jobDurationSeconds ? `${renderDuration({ value: jobDurationSeconds })}` : '-'}
          </span>
        </span>
      </footer>
    </div>
  );
};

export default DetailItem;
