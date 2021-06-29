export default class AppCenterApi {
  static getAppList(projectId: number) {
    return '';
  }

  static getEnvList(projectId: number) {
    return `/devops/v1/projects/${projectId}/envs/list_by_active?active=true`;
  }

  static getAppServiceDetail(projectId: number, appServiceId: string) {
    return `/devops/v1/projects/${projectId}/app_service/${appServiceId}`;
  }

  static getMarketAppServiceDetail(projectId: number, appServiceId: string) {
    return `/market/v1/projects/${projectId}/market/service/${appServiceId}/detail`;
  }

  static getDeployConfigList(projectId: number, appServiceId: string) {
    return `/devops/v1/projects/${projectId}/deploy_value/list_by_env_and_app?app_service_id=${appServiceId}`;
  }

  static createDeployConfig(projectId: number) {
    return `/devops/v1/projects/${projectId}/deploy_value`;
  }

  static checkDeployConfigName(projectId: number) {
    return `/devops/v1/projects/${projectId}/deploy_value/check_name`;
  }

  static getAppHasVersion(projectId: number) {
    return `/devops/v1/projects/${projectId}/app_service/list_app_services_having_versions`;
  }

  static getAppServiceValue(projectId: number, appServiceId: string) {
    return `/devops/v1/projects/${projectId}/app_service_versions/value?app_service_id=${appServiceId}`;
  }
}
