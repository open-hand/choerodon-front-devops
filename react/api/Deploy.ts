import Api from './Api';

class DeployApi extends Api<DeployApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy`;
  }

  deployApplication(applicationType: string) {
    return this.request({
      method: 'get',
      url: `/market/v1/projects/${this.projectId}/deploy/application`,
      params: {
        application_type: applicationType,
      },
    });
  }

  deployVersion(
    version: string,
    type: string,
  ) {
    return this.request({
      method: 'get',
      url: `/market/v1/projects/${this.projectId}/deploy/application/version/${version}`,
      params: {
        marketVersionId: version,
        type,
      },
    });
  }

  /**
   * 快速部署HZERO应用
   * @param data 部署参数
   */
  deployHzero(data: object) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/hzero`,
      data,
    });
  }
}

const deployApi = new DeployApi();
const deployApiConfig = new DeployApi(true);
export { deployApi, deployApiConfig };
