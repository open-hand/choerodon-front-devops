import Api from './Api';

class DeployAppCenterApi extends Api<DeployAppCenterApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/deploy_app_center`;
  }

  getDeployCenterAppList(params?: object) {
    const obj:any = {
      url: `${this.prefix}/page_by_env`,
      method: 'get',
    };
    if (params) {
      obj.params = params;
    }
    return this.request(obj);
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

  // 开启应用监控
  enableAppMonitor(appId:string) {
    return this.request({
      url: `${this.prefix}/${appId}/metric/enable?app_id=${appId}`,
      method: 'put',
    });
  }

  // 停用应用监控
  disableAppMonitor(appId:string) {
    return this.request({
      url: `${this.prefix}/${appId}/metric/disable?app_id=${appId}`,
      method: 'put',
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

  checkAppName(name: string, rdupmType?: string, objectId?: string, envId?: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_name`,
      params: {
        name,
        rdupmType,
        object_id: objectId,
        env_id: envId,
      },
    });
  }

  checkAppCode(code: string, rdupmType?: string, objectId?: string, envId?: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/check_code`,
      params: {
        code,
        rdupmType,
        objectId,
        env_id: envId,
      },
    });
  }

  getAppFromChart(envId: string, appServiceId: string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/chart`,
      params: {
        env_id: envId,
        app_service_id: appServiceId,
      },
    });
  }

  checkPipelinelinked(appId:string) {
    return this.request({
      method: 'get',
      url: `${this.prefix}/${appId}/pipeline_reference`,
    });
  }

  getNumber(data:any) { // 获取应用异常与停机次数表数据
    return this.request({
      url: `${this.prefix}/${data.appId}/metric/exception_times_chart_info?app_id=${data.appId}`,
      method: 'post',
      data: data.date,
    });
  }

  getDuration(data:any) { // 获取应用异常与停机次数表数据
    return this.request({
      url: `${this.prefix}/${data.appId}/metric/exception_duration_chart_info?app_id=${data.appId}`,
      method: 'post',
      data: data.date,
    });
  }
}

const deployAppCenterApi = new DeployAppCenterApi();
const deployAppCenterApiConfig = new DeployAppCenterApi(true);
export { deployAppCenterApi, deployAppCenterApiConfig };
