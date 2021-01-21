export default class InstanceApis {
  static getMarketValue(projectId: number, instanceId: string, versionId: string) {
    return `/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/upgrade_value?market_deploy_object_id=${versionId}`;
  }
}
