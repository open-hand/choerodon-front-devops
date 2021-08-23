import Api from './Api';

class AppServiceApi extends Api<AppServiceApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/app_service`;
  }

  getAppService(deployOnly: boolean, serviceType: string, type: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/list_all_app_services?deploy_only=${deployOnly}&service_type=${serviceType}&type=${type}`,
    });
  }
}

const appServiceApi = new AppServiceApi();
const appServiceApiConfig = new AppServiceApi(true);
export { appServiceApi, appServiceApiConfig };
