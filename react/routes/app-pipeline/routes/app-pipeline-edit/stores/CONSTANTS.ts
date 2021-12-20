const TAB_BASIC = 'basicInfo' as const;
const TAB_FLOW_CONFIG = 'flowConfiguration' as const;
const TAB_CI_CONFIG = 'ciConfigs' as const;
const TAB_ADVANCE_SETTINGS = 'advancedSettings' as const;

const tabsGroup = [TAB_BASIC, TAB_FLOW_CONFIG, TAB_CI_CONFIG, TAB_ADVANCE_SETTINGS] as const;

const STAGE_CI = 'CI' as const;

const STAGE_CD = 'CD' as const;

// job类型
// 构建
const JOB_GROUP_BUILD = {
  name: '构建',
  code: 'build',
  icon: 'build-o',
} as const;

// 测试构建
const JOB_GROUP_TEST_BUILD = {
  name: '测试构建',
  code: 'test-build',
  icon: 'test',
} as const;

// 单元测试
const JOB_GROUP_UNIT_TEST = {
  name: '单元测试',
  code: 'unit-test',
  icon: 'test_execution',
} as const;

// 代码扫描
const JOB_GROUP_CODE_SCANN = {
  name: '代码扫描',
  code: 'code-scann',
  icon: 'playlist_add_check',
} as const;

// 镜像构建
const JOB_GROUP_DOCKER_BUILD = {
  name: '镜像构建',
  code: 'docker-build',
  icon: 'build_circle-o',
} as const;

const JOB_GROUP_TYPES = {
  [JOB_GROUP_BUILD.code]: JOB_GROUP_BUILD,
  [JOB_GROUP_CODE_SCANN.code]: JOB_GROUP_CODE_SCANN,
  [JOB_GROUP_DOCKER_BUILD.code]: JOB_GROUP_DOCKER_BUILD,
  [JOB_GROUP_TEST_BUILD.code]: JOB_GROUP_TEST_BUILD,
  [JOB_GROUP_UNIT_TEST.code]: JOB_GROUP_UNIT_TEST,
} as const;

// 空白得分组
const DEFAULT_STAGES_DATA = {
  devopsCiPipelineVariableDTOList: [],
  devopsCiStageVOS: [
    {
      name: '代码扫描', sequence: 1, id: 1, type: 'CI',
    },
    {
      name: '构建', sequence: 2, id: 2, type: 'CI',
    },
    {
      name: '发布', sequence: 3, id: 3, type: 'CI',
    },
    {
      name: '部署', sequence: 4, id: 4, type: 'CI',
    },
  ],
  hasRecords: false,
  name: '默认模板',
} as const;

export {
  DEFAULT_STAGES_DATA,
};

export {
  TAB_BASIC,
  TAB_FLOW_CONFIG,
  TAB_CI_CONFIG,
  TAB_ADVANCE_SETTINGS,
  tabsGroup,

  // job分组类型
  JOB_GROUP_BUILD,
  JOB_GROUP_TEST_BUILD,
  JOB_GROUP_UNIT_TEST,
  JOB_GROUP_CODE_SCANN,
  JOB_GROUP_DOCKER_BUILD,
  JOB_GROUP_TYPES,

  STAGE_CD,
  STAGE_CI,
};
