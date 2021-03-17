export default class BaseComDeployApis {
  static getServiceVersionApi() {
    return '/market/v1/middleware/versions?middleware_name=Redis';
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

  static getHostListApi(projectId) {
    return `/devops/v1/projects/${projectId}/hosts/page_by_options`;
  }

  static getTestHostApi(projectId) {
    return `/devops/v1/projects/${projectId}/hosts/multi/connection_test`;
  }

  static getDeployHostApi(projectId) {
    return `/devops/v1/projects/${projectId}/middleware/redis/deploy/host`;
  }
}
