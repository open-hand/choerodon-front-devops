import Api from './Api';

class AppServiceVersionsApi extends Api<AppServiceVersionsApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/app_service_versions`;
  }

  getVersions(
    appServiceId: string,
    deployOnly: boolean,
    doPage: boolean,
  ) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/page_by_options`,
      params: {
        app_service_id: appServiceId,
        deploy_only: deployOnly,
        do_page: doPage,
      },
    });
  }

  getLookUpConfig(
    appServiceId: string,
  ) {
    return this.request({
      url: `${this.prefix}/page_by_options?app_service_id=${appServiceId}&deploy_only=false&do_page=true&page=1&size=40`,
      method: 'post',
    });
  }

  getYamlValueFromDeployConfig(appServiceId:string) {
    return this.request({
      url: `${this.prefix}/value?app_service_id=${appServiceId}`,
      method: 'get',
    });
  }
}

const appServiceVersionApi = new AppServiceVersionsApi();
const appServiceVersionApiConfig = new AppServiceVersionsApi(true);
export { appServiceVersionApi, appServiceVersionApiConfig };
