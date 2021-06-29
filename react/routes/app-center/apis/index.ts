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
}
