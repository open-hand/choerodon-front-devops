import React, { FC } from 'react';
import { Menu } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import useTabData from '@/routes/app-pipeline/routes/app-pipeline-edit/hooks/useTabData';
import { TAB_BASIC, TAB_FLOW_CONFIG } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';
import jobTypes from '@/routes/app-pipeline/routes/pipeline-manage/stores/jobsTypeMappings';
import './index.less';
import { LARGE, MIDDLE } from '@/utils/getModalWidth';
import AddCDTask
  from '@/routes/app-pipeline/routes/pipeline-manage/components/PipelineCreate/components/AddCDTask';

export type JobTypesPanelProps = {
  handleJobAddCallback:(addonData: any, addAndEdit:boolean)=>(editData:any)=>void
  handlePanelClickCallback:()=>void
  stageIndex:number
  jobIndex:number
  handleBlur:CallableFunction
}

const {
  SubMenu,
  Item,
} = Menu;

const prefixCls = 'c7ncd-job-cd-panel';

const JobCdPanel:FC<JobTypesPanelProps> = (props) => {
  const {
    handleJobAddCallback,
    handlePanelClickCallback,
    stageIndex,
    jobIndex,
  } = props;

  const [_data, _setdata, getTabData] = useTabData();

  const handleMenuSelect = (data:any) => {
    handlePanelClickCallback();
    const { keyPath } = data;
    const basicData = getTabData(TAB_BASIC);
    const {
      appService: {
        appServiceId,
        appServiceName,
      },
    } = basicData;
    Modal.open({
      key: Modal.key(),
      title: (
        <p>
          添加
          {/* @ts-ignore */}
          {jobTypes[keyPath[0]]}
        </p>
      ),
      style: {
        width: MIDDLE,
      },
      maskClosable: false,
      children: (
        <AddCDTask
          appServiceName={appServiceName}
          appServiceId={appServiceId}
          random={Math.random()}
          handleOk={handleJobAddCallback({ type: keyPath[0] }, false)}
          taskType={keyPath[0]}
          stageData={getTabData(TAB_FLOW_CONFIG)}
          stageIndex={stageIndex}
          jobIndex={jobIndex}
        />
      ),
      drawer: true,
      okText: '添加',
    });
  };

  return (
    <Menu
      onClick={handleMenuSelect}
      className={`${prefixCls}-subMenu`}
    >
      <SubMenu title="容器部署">
        <Item key="cdDeploy">Chart包</Item>
        <Item key="cdDeployment">部署组</Item>
      </SubMenu>
      <Item key="cdHost">主机部署</Item>
      <Item key="cdAudit">人工卡点</Item>
      <Item key="cdApiTest">API测试</Item>
      <Item key="cdExternalApproval">外部卡点</Item>
    </Menu>
  );
};

export default JobCdPanel;
