import Api from './Api';

class AppExternalConfigApi extends Api<AppExternalConfigApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/app_external_configs`;
  }

  outExternal(res: any, id:string) {
    return this.request({
      method: 'put',
      url: `${this.prefix}/${id}`,
      data: res,
    });
  }

  getOutExternal(id:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${id}`,
    });
  }
}

const appExternalConfigApi = new AppExternalConfigApi();
const appExternalConfigApiConfig = new AppExternalConfigApi(true);
export { appExternalConfigApi, appExternalConfigApiConfig };
