/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Tooltip } from 'choerodon-ui';
import { Modal, message, Icon } from 'choerodon-ui/pro';
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
import classnames from 'classnames';
import { saveAs } from 'file-saver';
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
import { JOB_GROUP_TYPES } from '@/routes/app-pipeline/stores/CONSTANTS';
import { openExcuteDetailModal } from './components/excute-details';
import { CHART_HOST } from '@/routes/app-center-pro/stores/CONST';

const prefixCls = 'c7n-piplineManage-detail-column';

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
    groupType,
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
    pipelineChartInfo,
    pipelineImageInfo,
    pipelineJarInfo,
    pipelineSonarInfo,
    apiTestTaskRecordVO, // api测试任务独有的
    externalApprovalJobVO,
    viewId,
    downloadMavenJarVO,
    // downloadImage,
    gitlabPipelineId,
    imageScan, // 是否显示镜像的扫描报告btn
    devopsCiUnitTestReportInfoList,
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
        pathname: `/devops/application-center/detail/${appId}/${chartSource || CHART_HOST}/${deployType}/${deployTypeId}/${rdupmType}`,
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

  const getRdupmType = (rdupmType) => {
    const data = {
      other: '其他制品',
      jar: 'jar包',
      image: 'docker镜像',
    };
    return data[rdupmType];
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
          <span>{getRdupmType(rdupmType)}</span>
        </div>
        <div>
          <span>生成应用:</span>
          <Tooltip title={appName}>
            <span
              style={{ color: '#3F51B5', cursor: 'pointer' }}
              onClick={() => {
                linkToAppDetailsInAppCenter({
                  appId,
                  chartSource,
                  rdupmType,
                  deployType,
                  deployTypeId,
                });
              }}
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
      ['cdHost', renderCdHost],
      ['cdApiTest', renderApiTest],
      ['cdExternalApproval', renderCdExternalApproval],
    ]);
    return funcMap.get(itemType) && funcMap.get(itemType)();
  };

  const logCheckDisabeldCondition = jobStatus === 'created';

  const renderRetryBtnFn = ['cdDeploy', 'cdHost', 'cdAudit', 'cdExternalApproval'].includes(itemType)
    ? handleCdJobRetry
    : handleJobRetry;

  const handleFileDownLoad = async (url, username, password, filename) => {
    const ele = document.createElement('a');
    ele.download = filename;
    ele.href = url;
    ele.style.display = 'none';
    document.body.appendChild(ele);
    ele.click();
    document.body.removeChild(ele);
    return;

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
        return true;
      }).catch((error) => {
        throw new Error(error);
      });
  };

  const handleJarDownload = () => {
    const jarUrl = get(pipelineJarInfo, 'downloadUrl');
    const server = get(pipelineJarInfo, 'server');
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
    copy(pipelineImageInfo?.downloadUrl);
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
          action: openDescModal.bind(null, itemType),
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
    if (itemType === 'cdApiTest' && ['success', 'failed'].includes(jobStatus)) {
      data.push({
        text: '查看详情',
        service: [],
        action: goToApiTest,
      });
    }

    if (['success', 'failed'].includes(jobStatus)) {
      devopsCiUnitTestReportInfoList?.forEach((item) => {
        const {
          type, reportUrl,
        } = item;
        const unitType = {
          maven_unit_test: {
            name: '下载Maven单测报告',
            filename: 'Maven单测报告.html',
          },
          node_js_unit_test: {
            name: '下载Node.js单测报告',
            filename: 'Nodejs单测报告.zip',
          },
          go_unit_test: {
            name: '下载Go单测报告',
            filename: 'Go单测报告.xml',
          },
          general_unit_test: {
            name: '下载单元测试(通用)报告',
            filename: '单元测试(通用)报告.xml',
          },
        };
        const handleDownload = () => {
          saveAs(reportUrl, unitType[type]?.filename);
        };
        data.push({
          service: [],
          text: unitType[type]?.name,
          action: handleDownload,
        });
      });
      pipelineJarInfo && data.push({
        service: [],
        text: 'jar包下载',
        action: handleJarDownload,
      });

      imageScan && jobStatus === 'success' && data.push({
        service: ['choerodon.code.project.develop.ci-pipeline.ps.job.imageReport'],
        text: format({ id: 'ScanReport' }),
        action: openMirrorScanningLog,
      });

      pipelineImageInfo && data.push({
        service: [],
        text: format({ id: 'CopyAddress' }),
        action: handleImageCopy,
      });

      pipelineSonarInfo && data.push({
        service: ['choerodon.code.project.develop.ci-pipeline.ps.job.sonarqube'],
        text: format({ id: 'QualityReport' }),
        action: openCodequalityModal,
      });
    }

    if (['custom', 'normal'].includes(itemType) && jobStatus === 'manual') {
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

  const renderJobPrefix = () => {
    if (itemType?.indexOf('cd') !== -1) {
      return `【${jobTypesMappings[itemType]}】`;
    }
    const currentJobGroupType = JOB_GROUP_TYPES?.[groupType];

    return (
      <Tooltip title={get(currentJobGroupType, 'name')}>
        <Icon className={`${prefixCls}-item-icon`} type={get(currentJobGroupType, 'icon')} />
      </Tooltip>
    );
  };

  const isDetailItemClickable = ['success', 'failed'].includes(jobStatus) && (
    pipelineChartInfo
    || pipelineImageInfo
    || pipelineSonarInfo
    || pipelineJarInfo
    || devopsCiUnitTestReportInfoList
  );

  const detailItemCls = classnames(`${prefixCls}-item`, {
    [`${prefixCls}-item-clickable`]: isDetailItemClickable,
  });

  return (
    <div
      className={detailItemCls}
      onClick={isDetailItemClickable ? openExcuteDetailModal.bind(null, {
        jobName,
        jobId: jobRecordId,
        devopsCiUnitTestReportInfoList,
        pipelineChartInfo,
        pipelineImageInfo,
        pipelineSonarInfo,
        pipelineJarInfo,
        imageScan,
        jobStatus,
        openCodequalityModal,
        handleJarDownload,
        openMirrorScanningLog,
        handleImageCopy,
      }) : () => {}}
    >
      <header>
        <StatusDot
          size={13}
          status={jobStatus}
          style={{ lineHeight: '22px', marginRight: '4px' }}
        />
        <div className={`${prefixCls}-item-sub`}>
          <div className={`${prefixCls}-item-title`}>
            {renderJobPrefix()}
            <Tooltip title={jobName}>
              {jobName}
            </Tooltip>
          </div>
          {startedDate && finishedDate && (
            <Tooltip title={`${startedDate}-${finishedDate}`}>
              <span className={`${prefixCls}-item-date`}>
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
        <span className={`${prefixCls}-item-time`}>
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
