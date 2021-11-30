const TAB_BASIC = 'basicInfo' as const;
const TAB_FLOW_CONFIG = 'flowConfiguration' as const;
const TAB_CI_CONFIG = 'ciConfigs' as const;
const TAB_ADVANCE_SETTINGS = 'advancedSettings' as const;

const tabsGroup = [TAB_BASIC, TAB_FLOW_CONFIG, TAB_CI_CONFIG, TAB_ADVANCE_SETTINGS] as const;

// job类型
// 构建
const JOB_BUILD = {
  name: '构建',
  code: 'build',
  icon: 'build-o',
} as const;

// 测试构建
const JOB_TEST_BUILD = {
  name: '测试构建',
  code: 'test-build',
  icon: 'test',
} as const;

// 单元测试
const JOB_UNIT_TEST = {
  name: '单元测试',
  code: 'unit-test',
  icon: 'test_execution',
} as const;

// 代码扫描
const JOB_CODE_SCANN = {
  name: '代码扫描',
  code: 'code-scann',
  icon: 'playlist_add_check',
} as const;

// 镜像构建
const JOB_DOCKER_BUILD = {
  name: '镜像构建',
  code: 'docker-build',
  icon: 'build_circle-o',
} as const;

const JOB_GROUP_TYPE = {
  [JOB_BUILD.code]: JOB_BUILD,
  [JOB_CODE_SCANN.code]: JOB_CODE_SCANN,
  [JOB_DOCKER_BUILD.code]: JOB_DOCKER_BUILD,
  [JOB_TEST_BUILD.code]: JOB_TEST_BUILD,
  [JOB_UNIT_TEST.code]: JOB_UNIT_TEST,
} as const;

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
  JOB_BUILD,
  JOB_TEST_BUILD,
  JOB_UNIT_TEST,
  JOB_CODE_SCANN,
  JOB_DOCKER_BUILD,
  JOB_GROUP_TYPE,
};
