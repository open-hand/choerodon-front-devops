import React, { FC } from 'react';
import { Menu } from 'choerodon-ui';
import useTabData from '@/routes/app-pipeline/routes/app-pipeline-edit/hooks/useTabData';
import { TAB_BASIC } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';
import './index.less';

export type JobTypesPanelProps = {
  handleJobAddCallback:(jobData: any)=>void
}

const {
  SubMenu,
  Item,
} = Menu;

const prefixCls = 'c7ncd-job-cd-panel';

const JobCdPanel:FC<JobTypesPanelProps> = (props) => {
  const {
    handleJobAddCallback,
  } = props;

  const [_data, _setdata, getTabData] = useTabData();

  const handleMenuSelect = (data:any) => {
    const { keyPath } = data;
    const basicData = getTabData(TAB_BASIC);
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
