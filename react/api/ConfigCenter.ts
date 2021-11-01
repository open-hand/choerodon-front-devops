import Api from './Api';

class ConfigCenterApi extends Api<ConfigCenterApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy_config`;
  }

  getConfigData(data: any) {
    return this.request({
      method: 'get',
      url: `${this.prefix}?${data.key}=${data.value}`,
      data: null,
    });
  }
}

const configApi = new ConfigCenterApi();
const configApiConfig = new ConfigCenterApi(true);
export { configApi, configApiConfig };
