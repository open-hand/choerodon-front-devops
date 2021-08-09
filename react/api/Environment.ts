import Api from './Api';

class EnvironmentApi extends Api<EnvironmentApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/envs`;
  }

  /**
   * 加载环境列表
   * @param params 额外的接口请求参数
   */
  loadEnvList(params = {}) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/list_by_active`,
      params: { active: true, ...params || {} },
    });
  }
}

const environmentApiApi = new EnvironmentApi();
const environmentApiConfig = new EnvironmentApi(true);
export { environmentApiApi, environmentApiConfig };
