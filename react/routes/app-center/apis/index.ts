export default class AppCenterApi {
  static getAppList(projectId: number) {
    return `/devops/v1/projects/${projectId}/app_service/app_center`;
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

  static checkDeleteDeployConfig(projectId: number, valueId: string) {
    return `/devops/v1/projects/${projectId}/deploy_value/check_delete?value_id=${valueId}`;
  }

  static deleteDeployConfig(projectId: number, valueId: string) {
    return `/devops/v1/projects/${projectId}/deploy_value?value_id=${valueId}`;
  }

  static getNonRelatedAppService(projectId: number) {
    return `/devops/v1/projects/${projectId}/env/app_services/non_related_app_service`;
  }

  static createRelatedAppService(projectId: number) {
    return `/devops/v1/projects/${projectId}/env/app_services/batch_create`;
  }

  static getRelatedEnvList(projectId: number, appServiceId: string) {
    return `/devops/v1/projects/${projectId}/app_service/app_center/envs/by_app_id?appServiceId=${appServiceId}`;
  }

  static deleteServiceRelated(projectId: number) {
    return `/devops/v1/projects/${projectId}/env/app_services`;
  }

  static getAppIngress(projectId:string, appServiceId:string, hostId:string) {
    // return '/devops/v1/projects/1/hosts/1/app/1/instance/list';
    // return `/devops/v1/projects/${projectId}/hosts/${hostId}/app/${appServiceId}/instance/list`;
    let baseUrl = `/devops/v1/projects/${projectId}/hosts/app/${appServiceId}/instance/list`;
    hostId && (baseUrl += `?hostId=${hostId}`);
    return baseUrl;
  }

  static getHostList(projectId: number) {
    return `/devops/v1/projects/${projectId}/hosts/page_by_options`;
  }

  static getAppListByHost(projectId: number) {
    return `/devops/v1/projects/${projectId}/app_service/app_center/host/app/list`;
  }
}
