import Api from './Api';

class ConfigMapsApi extends Api<ConfigMapsApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/config_maps`;
  }

  deleteInstance(id:string) {
    return this.request({
      url: `${this.prefix}/${id}`,
      method: 'delete',
    });
  }
}

const configMapApi = new ConfigMapsApi();
const configMapApiConfig = new ConfigMapsApi(true);
export { configMapApi, configMapApiConfig };
