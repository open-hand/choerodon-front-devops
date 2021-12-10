import Api from './Api';

class DeploymentsApi extends Api<DeploymentsApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deployments`;
  }

  // 删除部署组的app
  deleleDeployGroupApp(instanceId:string) {
    return this.request({
      url: `${this.prefix}?id=${instanceId}`,
      method: 'delete',
    });
  }

  getDeploymentsJson(instanceId:string) {
    return this.request({
      url: `${this.prefix}/${instanceId}/detail_json`,
      method: 'get',
    });
  }

  getDeploymentsYaml(instanceId:string) {
    return this.request({
      url: `${this.prefix}/${instanceId}/detail_yaml`,
      method: 'get',
    });
  }

  // 部署组启停用
  toggleDeployStatus(instanceId:string | number, active: 'stop' | 'start') {
    return this.request({
      url: `${this.prefix}/${instanceId}/${active}`,
      method: 'put',
    });
  }

  getTargetPort(deploymentId:string, transformResponse:any) {
    return this.request({
      url: `${this.prefix}/${deploymentId}/list_port`,
      method: 'get',
      transformResponse,
    });
  }
}

const deploymentsApi = new DeploymentsApi();
const deploymentsApiConfig = new DeploymentsApi(true);
export { deploymentsApi, deploymentsApiConfig };
