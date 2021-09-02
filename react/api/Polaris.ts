import Api from './Api';

class PolarisApi extends Api<PolarisApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/polaris`;
  }

  getPolarisRecordData(scopeId:string, scopeType?:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/records?scope=${scopeType || 'env'}&scope_id=${scopeId}`,
    });
  }

  getPolarisEnv(id:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/envs/${id}`,
    });
  }
}

const polarisApi = new PolarisApi();
const polarisApiConfig = new PolarisApi(true);
export { polarisApi, polarisApiConfig };
