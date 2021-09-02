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

  loadSingleData(id:string) {
    return this.request({
      url: `${this.prefix}/${id}`,
      method: 'get',
    });
  }

  putConfigMap(data:any) {
    return this.request({
      url: `${this.prefix}`,
      data,
      method: 'put',
    });
  }

  postConfigMap(data:any) {
    return this.request({
      url: `${this.prefix}`,
      data,
      method: 'post',
    });
  }

  checkName(envId:string, configName:string) {
    return this.request({
      url: `${this.prefix}/check_name?envId=${envId}&name=${configName}`,
      method: 'get',
    });
  }
}

const configMapApi = new ConfigMapsApi();
const configMapApiConfig = new ConfigMapsApi(true);
export { configMapApi, configMapApiConfig };
