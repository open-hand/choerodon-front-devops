const TAB_BASIC = 'basicInfo' as const;
const TAB_FLOW_CONFIG = 'flowConfiguration' as const;
const TAB_CI_CONFIG = 'ciConfigs' as const;
const TAB_ADVANCE_SETTINGS = 'advancedSettings' as const;

const tabsGroup = [TAB_BASIC, TAB_FLOW_CONFIG, TAB_CI_CONFIG, TAB_ADVANCE_SETTINGS] as const;

// job类型

// const JOB_BUILD = {
//   type: '构建',
//   icon: ''
// };
// const jobTypes = {
//   build: '构建',
//   sonar: '代码检查',
//   custom: '自定义',
//   chart: '发布Chart',
//   cdDeploy: '容器部署-chart包',
//   cdHost: '主机部署',
//   cdAudit: '人工卡点',
//   cdApiTest: 'API测试',
//   cdExternalApproval: '外部卡点',
//   cdDeployment: '容器部署-部署组',
// };

// export default jobTypes;

export {
  TAB_BASIC,
  TAB_FLOW_CONFIG,
  TAB_CI_CONFIG,
  TAB_ADVANCE_SETTINGS,
  tabsGroup,
};
