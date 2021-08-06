export default class DeployConfigApis {
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
