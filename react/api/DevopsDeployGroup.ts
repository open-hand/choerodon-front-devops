import Api from './Api';

class DevopsDeployGroupApi extends Api<DevopsDeployGroupApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/devops_deploy_group`;
  }

  createDeployGroup(type: string, data: any) {
    return this.request({
      method: 'post',
      url: `${this.prefix}/create_or_update`,
      params: {
        type,
      },
      data,
    });
  }
}

const devopsDeployGroupApi = new DevopsDeployGroupApi();
const devopsDeployGroupApiConfig = new DevopsDeployGroupApi(true);
export { devopsDeployGroupApi, devopsDeployGroupApiConfig };
