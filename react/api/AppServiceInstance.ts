import Api from './Api';

class AppServiceInstanceApi extends Api<AppServiceInstanceApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/app_service_instances`;
  }

  /**
   * 校验实例名称唯一性
   * @param envId 环境id
   * @param instanceName 实例名称
   */
  checkName(envId: string, instanceName: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_name`,
      params: {
        instance_name: instanceName,
        env_id: envId,
      },
    });
  }

  createAppServiceInstance(data: any) {
    return this.request({
      method: 'post',
      url: this.prefix,
      data,
    });
  }

  getDeployValue(versionId: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/deploy_value`,
      params: {
        type: 'create',
        version_id: versionId,
      },
    });
  }

  createMarketAppService(data: any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/market/instances`,
      data,
    });
  }
}

const appServiceInstanceApi = new AppServiceInstanceApi();
const appServiceInstanceApiConfig = new AppServiceInstanceApi(true);
export { appServiceInstanceApi, appServiceInstanceApiConfig };
