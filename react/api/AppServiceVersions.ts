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
}

const appServiceVersijonApi = new AppServiceVersionsApi();
const appServiceVersionApiConfig = new AppServiceVersionsApi(true);
export { appServiceVersijonApi, appServiceVersionApiConfig };
