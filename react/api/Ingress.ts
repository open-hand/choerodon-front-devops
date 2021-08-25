import Api from './Api';

class IngressApi extends Api<IngressApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/ingress`;
  }

  checkName(envId: string, name: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_name`,
      params: {
        env_id: envId,
        name,
      },
    });
  }

  checkDomain(domain: string, envId: string, path: string, ingressId: string) {
    return this.request({
      method: 'get',
      url: `/${this.prefix}/check_domain`,
      params: {
        domain,
        env_id: envId,
        path,
        id: ingressId || '',
      },
    });
  }
}

const ingressApi = new IngressApi();
const ingressApiConfig = new IngressApi(true);
export { ingressApi, ingressApiConfig };
