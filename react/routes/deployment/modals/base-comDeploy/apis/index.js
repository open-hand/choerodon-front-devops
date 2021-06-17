export default class BaseComDeployApis {
  static getParamsSettingApi(middlewareName, deployPattern, deployModel) {
    return `/market/v1/middleware/config?middlewareName=${middlewareName}&deployPattern=${deployPattern}&deployModel=${deployModel}`;
  }

  static getBaseDeployMySqlEnvAPi(projectId) {
    return `/devops/v1/projects/${projectId}/middleware/mysql/deploy/env`;
  }

  static getPvLabesUrl(projectId, clusterId) {
    return `/devops/v1/projects/${projectId}/pvs/labels?cluster_id=${clusterId}`;
  }

  static getBaseDployMySqlHostApi(projectId) {
    return `/devops/v1/projects/${projectId}/middleware/mysql/deploy/host`;
  }

  static getPvcListApi(projectId, envId) {
    return `/devops/v1/projects/${projectId}/pvcs/page_by_options?env_id=${envId}&page=0&size=0`;
  }

  static getServiceVersionApi(name) {
    return `/market/v1/middleware/versions?middleware_name=${name || 'Redis'}`;
  }

  static getEnvListApi(projectId) {
    return `/devops/v1/projects/${projectId}/envs/list_by_active?active=true`;
  }

  static getMiddleValueApi(appVersionId, mode) {
    return `/market/v1/middleware/values?market_app_version_id=${appVersionId}&mode=${mode}`;
  }

  static getDeployMiddlewareApi(projectId) {
    return `/devops/v1/projects/${projectId}/middleware/redis/deploy/env`;
  }

  static getHostListApi(projectId, random) {
    return `/devops/v1/projects/${projectId}/hosts/page_by_options?random=${random}`;
  }

  static getTestHostApi(projectId) {
    return `/devops/v1/projects/${projectId}/hosts/multi/connection_test`;
  }

  static getDeployHostApi(projectId) {
    return `/devops/v1/projects/${projectId}/middleware/redis/deploy/host`;
  }
}
