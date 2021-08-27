import Api from './Api';

class CertificationsApi extends Api<CertificationsApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/certifications`;
  }

  getActive(envId: string, domain: string) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/active`,
      params: {
        env_id: envId,
        domain,
      },
    });
  }

  deleteInstance(id:string) {
    return this.request({
      url: `${this.prefix}?cert_id=${id}`,
      method: 'delete',
    });
  }
}

const certificationsApi = new CertificationsApi();
const certificationsApiConfig = new CertificationsApi(true);
export { certificationsApi, certificationsApiConfig };
