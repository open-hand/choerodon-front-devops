const MAVEN_BUILD = 'normal';

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

const STEPVO: any = {
  [BUILD_DOCKER]: 'dockerBuildConfig',
  [BUILD_MAVEN]: 'mavenBuildConfig',
  [BUILD_MAVEN_PUBLISH]: 'mavenPublishConfig',
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
};
