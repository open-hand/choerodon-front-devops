const PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY = 'PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY';

export {
  PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY,
};

export const DEFAULT_TMP_ID = 'default';

const getDefaultStageTmp = (id:number) => ({
  id: `${id}-stage`,
  name: '',
  sequence: null,
  ciTemplateJobVOList: [{
    id: '0',
    image: null,
    name: '',
  }],
});

const DEFAULT_TMP = {
  id: DEFAULT_TMP_ID,
  builtIn: true,
  ciTemplateCategoryId: DEFAULT_TMP_ID,
  enable: 1,
  image: null,
  name: '空白模板',
  sourceId: 0,
  sourceType: 'site',
  versionName: null,
  ciTemplateStageVOList: new Array(3).fill(0).map((_data, index) => getDefaultStageTmp(index)),
} as const;

export {
  DEFAULT_TMP,
};

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
  code: 'code-scan',
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

export {
  // job分组类型
  JOB_GROUP_BUILD,
  JOB_GROUP_TEST_BUILD,
  JOB_GROUP_UNIT_TEST,
  JOB_GROUP_CODE_SCANN,
  JOB_GROUP_DOCKER_BUILD,
  JOB_GROUP_TYPES,
};
