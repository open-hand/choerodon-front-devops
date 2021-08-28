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

  checkName(value:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_name?name=${encodeURIComponent(value)}`,
    });
  }

  checkCode(value:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_code?code=${value}`,
    });
  }

  batchTransfer(res:any) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/batch_transfer`,
      data: res,
    });
  }

  Import(url:string, res:any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/import/${url}`,
      data: res,
    });
  }
}

const appServiceApi = new AppServiceApi();
const appServiceApiConfig = new AppServiceApi(true);
export { appServiceApi, appServiceApiConfig };
