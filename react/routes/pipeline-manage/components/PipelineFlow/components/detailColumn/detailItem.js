/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Tooltip } from 'choerodon-ui';
import { Button, Modal, message } from 'choerodon-ui/pro';
import {
  WritableStream,
} from 'web-streams-polyfill/ponyfill';
import {
  Choerodon, Permission, Action,
} from '@choerodon/boot';
import copy from 'copy-to-clipboard';
import StreamSaver from 'streamsaver';
import { Base64 } from 'js-base64';
import { get } from 'lodash';
import renderDuration from '@/utils/getDuration';
import { handlePromptError } from '@/utils';
import StatusTag from '../StatusTag';
import DepolyLog from '../deployLog';
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
    },
    projectId,
  } = usePipelineManageStore();

  const {
    jobDurationSeconds,
    jobStatus,
    startedDate,
    finishedDate,
    itemType,
    gitlabJobId,
    devopsJobId,
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
    cdHostDeployConfigVO,
    sonarScannerType,
    codeCoverage,
    apiTestTaskRecordVO, // api测试任务独有的
    externalApprovalJobVO,
    viewId,
    downloadMavenJarVO,
    downloadNpm,
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

  function openCdLog() {
    const logData = {
      projectId,
      cdRecordId,
      stageId,
      jobRecordId,
    };
    Modal.open({
      title: `查看${jobTypesMappings[itemType]}日志`,
      key: Modal.key(),
      style: {
        width: 'calc(100vw - 3.52rem)',
      },
      children: <DepolyLog {...logData} />,
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
      const res = await retryJob(projectId, gitlabProjectId, gitlabJobId);
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

  const renderCdAuto = () => {
    const {
      envName,
      appServiceName: cdJobAppServiceName,
      appServiceVersion: cdJobAppServiceVersion,
      instanceName,
      envId,
      instanceId,
    } = cdAuto || {};

    function linkTo() {
      if (instanceId && instanceName) {
        history.push({
          pathname: '/devops/resource',
          search,
          state: {
            instanceId,
            appServiceId,
            envId,
          },
        });
      } else {
        history.push(`/devops/resource${search}`);
      }
    }

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
          <span>生成实例:</span>
          <Tooltip title={instanceName}>
            <span
              style={{ color: '#3F51B5', cursor: 'pointer' }}
              onClick={linkTo}
            >
              {(jobStatus !== 'created' && instanceName) || '-'}
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

  const renderCdHost = () => {
    const {
      hostDeployType,
      imageDeploy,
      jarDeploy,
    } = cdHostDeployConfigVO;
    let hostTypeName = '';
    let hostSource = '';
    let hostTaskName = '';
    switch (hostDeployType) {
      case 'image':
        hostTypeName = '镜像部署';
        hostSource = imageDeploy.deploySource === 'pipelineDeploy'
          ? '流水线制品部署'
          : '匹配制品部署';
        hostTaskName = imageDeploy.pipelineTask;
        break;
      case 'jar':
        hostTypeName = 'jar部署';
        hostSource = jarDeploy.deploySource === 'pipelineDeploy'
          ? '流水线制品部署'
          : '匹配制品部署';
        hostTaskName = jarDeploy.pipelineTask;
        break;
      case 'customize':
        hostTypeName = '自定义命令';
        hostSource = '-';
        hostTaskName = '-';
        break;
      default:
        hostTypeName = '-';
        break;
    }
    return (
      <main>
        <div>
          <span>部署模式:</span>
          <span>{hostTypeName}</span>
        </div>
        <div>
          <span>部署来源:</span>
          <span>{hostSource}</span>
        </div>
        <div>
          <span>构建任务名称:</span>
          <span>{hostTaskName}</span>
        </div>
      </main>
    );
  };

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
      ['cdDeploy', renderCdAuto],
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
    if (itemType === 'cdDeploy') {
      openCdLog();
      return;
    }
    openDescModal(itemType);
  };

  const logCheckDisabeldCondition = ['created', 'skipped'].includes(jobStatus) || (itemType === 'cdDeploy' && jobStatus === 'failed');

  const renderLogCheckBtn = () => (
    <Permission
      service={['choerodon.code.project.develop.ci-pipeline.ps.job.log']}
    >
      <Tooltip title="查看日志">
        <Button
          funcType="flat"
          shape="circle"
          size="small"
          icon="description-o"
          disabled={logCheckDisabeldCondition}
          onClick={renderCheckLogFun}
          color="primary"
        />
      </Tooltip>
    </Permission>
  );

  const renderRetryBtnFn = ['cdDeploy', 'cdHost', 'cdAudit', 'cdExternalApproval'].includes(itemType)
    ? handleCdJobRetry
    : handleJobRetry;

  const renderRetryBtn = () => {
    const clickFn = renderRetryBtnFn;
    return (
      <Permission
        service={[
          'choerodon.code.project.develop.ci-pipeline.ps.job.retry',
        ]}
      >
        <Tooltip title="重试">
          <Button
            funcType="flat"
            disabled={getRetryBtnDisabled()}
            shape="circle"
            size="small"
            icon="refresh"
            color="primary"
            onClick={clickFn}
          />
        </Tooltip>
      </Permission>
    );
  };

  const renderCodeQualityBtn = () => (
    <Permission
      service={[
        'choerodon.code.project.develop.ci-pipeline.ps.job.sonarqube',
      ]}
    >
      <Tooltip title="查看代码质量报告">
        <Button
          funcType="flat"
          shape="circle"
          size="small"
          onClick={openCodequalityModal}
          icon="policy-o"
          color="primary"
        />
      </Tooltip>
    </Permission>
  );

  const renderCheckDetailsBtn = () => (
    <Tooltip title="查看详情">
      <Button
        funcType="flat"
        shape="circle"
        size="small"
        disabled={jobStatus === 'created'}
        onClick={goToApiTest}
        icon="find_in_page-o"
        color="primary"
      />
    </Tooltip>
  );

  const handleFileDownLoad = async (url, username, password, filename) => {
    const tempHeader = new Headers();
    tempHeader.append('Authorization', `Basic ${Base64.encode(`${username}:${password}`)}`);
    fetch('https://api.choerodon.com.cn/rdupm/v1/nexus/proxy/1/repository/maven-demo-snapshot/io/choerodon/springboot/0.0.1-SNAPSHOT/springboot-0.0.1-20210310.020647-1.jar', {
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
        if (window.WritableStream && readableStream.pipeTo) {
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
      cancelProps: {
        color: 'dark',
      },
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
      children: <MirrorScanning jobId={devopsJobId} gitlabPipelineId={gitlabPipelineId} />,
      style: {
        width: '740px',
      },
      drawer: true,
    });
  };

  const renderFooterBtns = () => {
    const cp = [];
    if (itemType === 'build') {
      const data = [
        {
          service: ['choerodon.code.project.develop.ci-pipeline.ps.job.log'],
          text: '查看日志',
          action: renderCheckLogFun,
          disabled: logCheckDisabeldCondition,
        },
        {
          service: ['choerodon.code.project.develop.ci-pipeline.ps.job.retry'],
          text: '重试',
          action: renderRetryBtnFn,
          disabled: getRetryBtnDisabled(),
        },
      ];
      downloadMavenJarVO && data.push({
        service: [''],
        text: 'jar包下载',
        action: handleJarDownload,
      });
      imageScan && data.push({
        service: ['choerodon.code.project.develop.ci-pipeline.ps.job.imageReport'],
        text: '查看镜像扫描报告',
        action: openMirrorScanningLog,
      });
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
        text: '复制镜像下载命令',
        action: handleImageCopy,
        // disabled: getRetryBtnDisabled(),
      });
      return (
        <Action data={data} />
      );
    }
    if (!['cdAudit', 'cdApiTest'].includes(itemType)) {
      cp.push(renderLogCheckBtn());
      cp.push(renderRetryBtn());
    }
    if (itemType === 'sonar') {
      cp.push(renderCodeQualityBtn());
    }
    if (itemType === 'cdApiTest') {
      cp.push(renderCheckDetailsBtn());
    }
    return cp;
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
