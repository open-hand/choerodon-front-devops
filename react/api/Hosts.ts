import Api from './Api';

class HostApi extends Api<HostApi> {
  get prefix() {
    return `/devops/v1/projects/${this.projectId}/hosts`;
  }

  // 加载主机的
  loadHostsList(params = {}) {
    return this.request({
      url: `${this.prefix}/page_by_options`,
      method: 'post',
      params: { do_page: false, ...params || {} },
    });
  }

  // 删除jar包
  jarDelete(hostId:string, instanceId:string) {
    return this.request({
      url: `${this.prefix}/${hostId}/apps/${instanceId}`,
      method: 'delete',
    });
  }

  loadHostsAppList() {
    return this.request({
      url: `${this.prefix}/apps/paging`,
      method: 'get',
    });
  }

  // 查询主机下的应用实例详情
  loadHostAppDetail(appId:string) {
    return this.request({
      url: `${this.prefix}/apps/${appId}`,
      method: 'get',
    });
  }

  checkAppName(name: string, appId?: string) {
    return this.request({
      url: `${this.prefix}/apps/check_name`,
      method: 'get',
      params: {
        name,
        app_id: appId,
      },
    });
  }

  checkAppCode(code: string) {
    return this.request({
      url: `${this.prefix}/apps/check_code`,
      method: 'get',
      params: {
        code,
      },
    });
  }

  checkAppPipelineLinked(appId:string) {
    return this.request({
      url: `${this.prefix}/apps/${appId}/pipeline_reference`,
      method: 'get',
    });
  }
}

const hostApi = new HostApi();
const hostApiConfig = new HostApi(true);
export { hostApi, hostApiConfig };
