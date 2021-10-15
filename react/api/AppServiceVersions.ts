import Api from './Api';

class AppServiceVersionsApi extends Api<AppServiceVersionsApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/app_service_versions`;
  }

  getVersions(
    appServiceId: string,
    deployOnly: boolean,
    doPage: boolean,
    othersParams: object = {},
    appServiceVersionId?: any,
  ) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/page_by_options`,
      params: {
        additional_version_id: appServiceVersionId,
        app_service_id: appServiceId,
        deploy_only: deployOnly,
        do_page: doPage,
        ...othersParams,
      },
    });
  }

  getLookUpConfig(
    appServiceId: string,
  ) {
    return this.request({
      url: `${this.prefix}/page/share_versions?app_service_id=${appServiceId}&page=0&size=20`,
      method: 'get',
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
