import Api from './Api';

class ServiceApi extends Api<ServiceApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/service`;
  }

  checkEnvName(id: string, name: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_name`,
      params: {
        env_id: id,
        name,
      },
    });
  }
}

const serviceApi = new ServiceApi();
const serviceApiConfig = new ServiceApi(true);
export { serviceApi, serviceApiConfig };
