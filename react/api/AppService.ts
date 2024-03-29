import Api from './Api';

class AppServiceApi extends Api<AppServiceApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/app_service`;
  }

  getAppService(
    deployOnly: boolean,
    serviceType: string,
    type: string,
    param?: string,
    appServiceId?: any,
  ) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/list_all_app_services?deploy_only=${deployOnly}&service_type=${serviceType}&type=${type}&param=${param || ''}${appServiceId ? `&app_service_id=${appServiceId}` : ''}`,
    });
  }

  checkName(value: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_name?name=${encodeURIComponent(value)}`,
    });
  }

  checkCode(value: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_code?code=${value}`,
    });
  }

  batchTransfer(res: any) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/batch_transfer`,
      data: res,
    });
  }

  Import(url: string, res: any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/import/${url}`,
      data: res,
    });
  }

  batchCheck(res: any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/batch_check`,
      data: res,
    });
  }

  pageByMode(share: any, url: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/page_by_mode?share=${share || true}${url}&include_external=false`,
    });
  }

  listProjectsByShare(isShare: any) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/list_project_by_share?share=${isShare}&include_external=false`,
    });
  }

  external(res: any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/external`,
      data: res,
    });
  }

  checkRepositoryUrl(repositoryUrl: any) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/external/check_gitlab_url?external_gitlab_url=${repositoryUrl}`,
    });
  }

  testConnection(appExternalConfigDTO:any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/external/test_connection`,
      data: appExternalConfigDTO,
    });
  }

  listAllAppservices(type:string) {
    return this.request({
      url: `${this.prefix}/list_all_app_services?deploy_only=false&type=${type}&include_external=false`,
      method: 'get',
    });
  }
}

const appServiceApi = new AppServiceApi();
const appServiceApiConfig = new AppServiceApi(true);
export { appServiceApi, appServiceApiConfig };
