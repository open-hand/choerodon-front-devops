import Api from './Api';

class DeployAppCenterApi extends Api<DeployAppCenterApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy_app_center`;
  }

  getDeployCenterAppList() {
    return this.request({
      url: `${this.prefix}/page_by_env`,
      method: 'get',
    });
  }

  // loadEvents
  loadEvents(appCenterId:string) {
    return this.request({
      url: `${this.prefix}/${appCenterId}/env_event`,
      method: 'get',
    });
  }

  // app detail of env
  loadEnvAppDetail(appId:string) {
    return this.request({
      url: `${this.prefix}/${appId}/env_detail`,
      method: 'get',
    });
  }

  // env pods page
  loadPodsPage(appCenterId:string) {
    return this.request({
      url: `${this.prefix}/${appCenterId}/env_pods_page`,
      method: 'post',
      data: {
        params: [],
        searchParam: {},
      },
    });
  }

  // env chart service
  loadEnvChartService(appCenterId:string) {
    return this.request({
      url: `${this.prefix}/${appCenterId}/env_chart_service`,
      method: 'post',
    });
  }

  // env_resources
  loadEnvSource(appCenterId:string) {
    return this.request({
      url: `${this.prefix}/${appCenterId}/env_resources`,
      method: 'get',
    });
  }

  checkAppName(name: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_name`,
      params: {
        name,
      },
    });
  }

  checkAppCode(code: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_code`,
      params: {
        code,
      },
    });
  }
}

const deployAppCenterApi = new DeployAppCenterApi();
const deployAppCenterApiConfig = new DeployAppCenterApi(true);
export { deployAppCenterApi, deployAppCenterApiConfig };
