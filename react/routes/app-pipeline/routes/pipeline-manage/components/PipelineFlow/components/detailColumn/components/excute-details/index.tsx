import React, {
  FC,
} from 'react';
import { useFormatCommon, useFormatMessage, Action } from '@choerodon/master';
import { Modal } from 'choerodon-ui/pro';
// @ts-ignore
import { saveAs } from 'file-saver';
import {} from '@choerodon/components';
import classnames from 'classnames';

import './index.less';

export type ExcuteDetailsProps = {
  jobName:string
  jobId:string
  devopsCiUnitTestReportInfoList:any[]
  pipelineChartInfo:Record<string, any>
  pipelineImageInfo:Record<string, any>
  pipelineSonarInfo:Record<string, any>
  pipelineJarInfo:Record<string, any>
  openCodequalityModal:Function
  handleJarDownload:Function
  handleImageCopy:Function
  openMirrorScanningLog:Function
  imageScan:any,
  jobStatus:any
}

export type ExcuteDetailsModalProps = {

}

const prefixCls = 'c7ncd-excute-details';
const intlPrefix = 'c7ncd.excute.details';

const ExcuteDetails:FC<ExcuteDetailsProps> = (props) => {
  const {
    devopsCiUnitTestReportInfoList,
    pipelineChartInfo,
    pipelineImageInfo,
    pipelineSonarInfo,
    pipelineJarInfo,
    openCodequalityModal,
    handleJarDownload,
    handleImageCopy,
    openMirrorScanningLog,
    imageScan,
    jobStatus,
  } = props;

  const formatCommon = useFormatCommon();
  const formatExcuteDetails = useFormatMessage(intlPrefix);

  const renderUnitSection = () => devopsCiUnitTestReportInfoList.map((item:any) => {
    const {
      type, passes, reportUrl, failures, skipped, tests, successRate = 0,
    } = item;
    const unitType:any = {
      maven_unit_test: {
        name: 'Maven单测报告',
        filename: 'Maven单测报告.html',
      },
      node_js_unit_test: {
        name: 'Node.js单测报告',
        filename: 'Nodejs单测报告.zip',
      },
      go_unit_test: {
        name: 'Go单测报告',
        filename: 'Go单测报告.xml',
      },
    };
    const handleDownload = () => {
      saveAs(reportUrl, unitType[type]?.filename);
    };
    return (
      <div className={`${prefixCls}-unitTest-section`}>
        <Action
          data={[
            {
              text: '下载单测报告',
              action: handleDownload,
            },
          ]}
          className={`${prefixCls}-unitTest-section-button`}
        />
        <main>
          <div className={`${prefixCls}-unitTest-section-title`}>{unitType[type].name}</div>
          <div className={`${prefixCls}-unitTest-section-group`}>
            <div className={`${prefixCls}-unitTest-section-group-item`}>
              <span style={{ color: '#0F1358' }}>{tests}</span>
              <span>用例总数</span>
            </div>
            <div className={`${prefixCls}-unitTest-section-group-item`}>
              <span style={{ color: '#1FC2BB' }}>{passes}</span>
              <span>成功</span>
            </div>
            <div className={`${prefixCls}-unitTest-section-group-item`}>
              <span style={{ color: '#FD729C' }}>{failures}</span>
              <span>失败</span>
            </div>
            <div className={`${prefixCls}-unitTest-section-group-item`}>
              <span style={{ color: '#9EADBE' }}>{skipped}</span>
              <span>跳过</span>
            </div>
          </div>
        </main>
        <footer>
          <span>单元测试通过率：</span>
          <span>
            {successRate}
            %
          </span>
        </footer>
      </div>
    );
  });

  const renderUnitTest = () => {
    const cls = classnames(`${prefixCls}-box`, `${prefixCls}-unitTest`);
    return devopsCiUnitTestReportInfoList?.length
      ? (
        <div className={cls}>
          <header>
            <span />
            <span>单元测试</span>
          </header>
          <main>
            {renderUnitSection()}
          </main>
        </div>
      )
      : '';
  };

  const renderSonarSection = () => {
    const { scannerType, sonarContentVOS } = pipelineSonarInfo;
    const scanMap:any = {
      code_smells: '代码异味',
      vulnerabilities: '安全漏洞',
      bugs: 'Bugs',
      sqale_index: '技术债务',
    };
    return (
      <div className={`${prefixCls}-sonar-section`}>
        <main>
          <div className={`${prefixCls}-sonar-section-group`}>
            {
              sonarContentVOS.map(({
                value, rate, key, url,
              }:any) => (
                <div className={`${prefixCls}-sonar-section-group-item`}>
                  <span><a href={url} target="_blank" rel="noreferrer">{value || '-'}</a></span>
                  <span>{scanMap[key]}</span>
                </div>
              ))
            }
          </div>
        </main>
        <footer>
          <span>检查类型：</span>
          <span>{scannerType || '-'}</span>
        </footer>
      </div>
    );
  };

  const renderSonar = () => {
    const cls = classnames(`${prefixCls}-box`, `${prefixCls}-sonar`);
    return (
      pipelineSonarInfo && (
      <div className={cls}>
        <Action
          data={[{
            service: [],
            text: '查看代码质量报告',
            action: openCodequalityModal,
          }]}
          className={`${prefixCls}-sonar-button`}
          icon="more_vert"
        />
        <header>
          <span />
          <span>SonarQube代码检查</span>
        </header>
        <main>
          {renderSonarSection()}
        </main>
      </div>
      )
    );
  };

  const renderPipelineJobDetailSection = () => {
    const cls = classnames(`${prefixCls}-pipeline-section`);
    const {
      groupId, artifactId, version, downloadUrl,
    } = pipelineJarInfo || {};
    const { imageTag } = pipelineImageInfo || {};
    const { chartVersion } = pipelineChartInfo || {};
    return (
      <div className={cls}>
        {pipelineJarInfo && (
        <div className={`${cls}-item`}>
          <span>生成Jar包：</span>
          <span>
            <span>
              GroupId：
              {groupId || '-'}
            </span>
            <span>
              ArtifactId：
              {artifactId || '-'}
            </span>
            <span>
              Jar包版本：
              {downloadUrl ? <a href={downloadUrl} target="_blank" rel="noreferrer">{version}</a> : (version || '-')}
            </span>
          </span>
        </div>
        )}
        {pipelineImageInfo && (
        <div className={`${cls}-item`}>
          <span>生成镜像地址：</span>
          <span>
            {imageTag || '-'}
          </span>
        </div>
        )}
        {
          pipelineChartInfo && (
          <div className={`${cls}-item`}>
            <span>生成Chart版本：</span>
            <span>{chartVersion || '-'}</span>
          </div>
          )
        }
      </div>
    );
  };

  const renderPipelineJobDetail = () => {
    const cls = classnames(`${prefixCls}-box`, `${prefixCls}-pipeline`);
    const data = [];

    pipelineJarInfo && data.push({
      service: [],
      text: 'jar包下载',
      action: handleJarDownload,
    });

    imageScan && jobStatus === 'success' && data.push({
      service: ['choerodon.code.project.develop.ci-pipeline.ps.job.imageReport'],
      text: '查看镜像扫描报告',
      action: openMirrorScanningLog,
    });

    pipelineImageInfo && data.push({
      service: [],
      text: '复制镜像下载指令',
      action: handleImageCopy,
    });
    return (
      (pipelineJarInfo || pipelineImageInfo || pipelineChartInfo) && (
      <div className={cls}>
        <Action
          data={data}
          className={`${prefixCls}-sonar-button`}
          icon="more_vert"
        />
        <header>
          <span />
          <span>流水线产物</span>
        </header>
        <main>
          {renderPipelineJobDetailSection()}
        </main>
      </div>
      )
    );
  };

  return (
    <div className={prefixCls}>
      {renderUnitTest()}
      {renderSonar()}
      {renderPipelineJobDetail()}
    </div>
  );
};

export function openExcuteDetailModal(props:ExcuteDetailsProps) {
  const {
    jobName,
  } = props;
  Modal.open({
    key: Modal.key(),
    title: `任务"${jobName}"的详情`,
    children: <ExcuteDetails {...props} />,
    okText: '关闭',
    drawer: true,
    style: {
      width: 380,
    },
    okCancel: false,
  });
}

export default ExcuteDetails;
