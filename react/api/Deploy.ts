import Api from './Api';

class DeployApi extends Api<DeployApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy`;
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
