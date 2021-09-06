import Api from './Api';

class DeployValueApi extends Api<DeployValueApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy_value`;
  }

  getValueIdList({
    appServiceId,
    envId,
    random,
    createValueRandom,
  }: {
    appServiceId: string,
    envId: string,
    random: string,
    createValueRandom: string,
  }) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/list_by_env_and_app`,
      params: {
        app_service_id: appServiceId,
        env_id: envId,
        random,
        createValueRandom,
      },
    });
  }
}

const deployValueApi = new DeployValueApi();
const deployValueApiConfig = new DeployValueApi(true);
export { deployValueApi, deployValueApiConfig };
