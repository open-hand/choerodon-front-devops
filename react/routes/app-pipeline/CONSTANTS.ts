const MAVEN_BUILD = 'normal';
const CUSTOM_BUILD = 'custom';

const PIPELINE_TEMPLATE = 'pipeline';
const TASK_TEMPLATE = 'task';
const STEP_TEMPLATE = 'step';

// 构建类型
const BUILD = 'build';
const BUILD_MAVEN = 'maven_build';
const BUILD_NPM = 'npm_build';
const BUILD_DOCKER = 'docker_build';
const BUILD_UPLOADJAR = 'upload_jar';
const BUILD_GO = 'go_build';
const BUILD_MAVEN_PUBLISH = 'maven_publish';
const BUILD_SONARQUBE = 'sonar';
const BUILD_UPLOAD_CHART_CHOERODON = 'upload_chart';
const MAVEN_UNIT_TEST = 'maven_unit_test';
const GO_UNIT_TEST = 'go_unit_test';
const NODE_JS_UNIT_TEST = 'node_js_unit_test';

const STEPVO: any = {
  [BUILD_DOCKER]: 'dockerBuildConfig',
  [BUILD_MAVEN]: 'mavenBuildConfig',
  [BUILD_MAVEN_PUBLISH]: 'mavenPublishConfig',
  [BUILD_SONARQUBE]: 'sonarConfig',
  [BUILD_UPLOADJAR]: 'mavenPublishConfig',
};

const CUSTOM = 'custom';

export {
  MAVEN_BUILD,
  BUILD,
  BUILD_MAVEN,
  BUILD_NPM,
  BUILD_DOCKER,
  BUILD_UPLOADJAR,
  BUILD_GO,
  BUILD_MAVEN_PUBLISH,
  BUILD_SONARQUBE,
  BUILD_UPLOAD_CHART_CHOERODON,
  CUSTOM,
  STEPVO,
  CUSTOM_BUILD,
  PIPELINE_TEMPLATE,
  TASK_TEMPLATE,
  STEP_TEMPLATE,
  MAVEN_UNIT_TEST,
  GO_UNIT_TEST,
  NODE_JS_UNIT_TEST,
};
