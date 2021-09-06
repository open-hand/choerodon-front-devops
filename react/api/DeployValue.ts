import Api from './Api';

class DeployValueApi extends Api<DeployValueApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy_value`;
  }

  deleteDeployValue(valueId: string, data: any) {
    return this.request({
      method: 'delete',
      url: `${this.prefix}?value_id=${valueId}`,
      data,
    });
  }

  checkDelete(valueId:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_delete?value_id=${valueId}`,
    });
  }

  loadDeployValue(envId: string, data:any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/page_by_options?env_id=${envId}`,
      data,
    });
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
const deployValueConfigApi = new DeployValueApi(true);

export { deployValueApi, deployValueConfigApi };
