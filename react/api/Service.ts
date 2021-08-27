import Api from './Api';

class ServiceApi extends Api<ServiceApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/service`;
  }

  checkEnvName(id: string, name: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/checkName`,
      params: {
        env_id: id,
        name,
      },
    });
  }

  deleteInstance(id:string) {
    return this.request({
      url: `${this.prefix}/${id}`,
      method: 'delete',
    });
  }
}

const serviceApi = new ServiceApi();
const serviceApiConfig = new ServiceApi(true);
export { serviceApi, serviceApiConfig };
