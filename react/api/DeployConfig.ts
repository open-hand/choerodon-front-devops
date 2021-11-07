import Api from './Api';

class DeployConfigApi extends Api<DeployConfigApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy_config`;
  }

  getDeployConfigData(data: any) {
    return this.request({
      method: 'get',
      url: `${this.prefix}?${data.key}=${data.value}`,
      data: null,
    });
  }
}

const deployConfigApi = new DeployConfigApi();
const deployConfigApiConfig = new DeployConfigApi(true);
export { deployConfigApi, deployConfigApiConfig };
