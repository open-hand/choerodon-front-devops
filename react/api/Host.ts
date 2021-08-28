import Api from './Api';

class HostApi extends Api<HostApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/hosts`;
  }

  getHosts() {
    return this.request({
      method: 'post',
      url: `${this.prefix}/page_by_options`,
    });
  }
}

const hostApi = new HostApi();
const hostApiConfig = new HostApi(true);
export { hostApi, hostApiConfig };
