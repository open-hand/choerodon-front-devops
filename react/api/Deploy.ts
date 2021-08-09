import Api from './Api';

class DeployApi extends Api<DeployApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy`;
  }

  /**
   * 加载环境列表
   * @param params 额外的接口请求参数
   */
  deployHzero(params = {}) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/hzero`,
      params: { active: true, ...params || {} },
    });
  }
}

const deployApi = new DeployApi();
const deployApiConfig = new DeployApi(true);
export { deployApi, deployApiConfig };
